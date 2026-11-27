/**
 * Real Supabase Auth + PostgreSQL Constraints + 2-User RLS Isolation Suite.
 *
 * Uses ONLY NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * from .env.local (NEVER service_role).
 *
 * Respects Supabase Auth email confirmation policy:
 * - Reads /auth/v1/settings first without sending any emails.
 * - If mailer_autoconfirm is false, uses controlled pre-confirmed test accounts
 *   provided via TEST_USER_A_EMAIL / TEST_USER_A_PASSWORD and
 *   TEST_USER_B_EMAIL / TEST_USER_B_PASSWORD (in .env.local or process env),
 *   never firing uncontrolled emails to fake addresses.
 * - Cleans up only the temporary test records it creates, leaving the database tidy.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, "utf8");
  const parsed = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    parsed[key] = val;
  }
  return parsed;
}

const envLocal = loadEnvLocal();
function getEnv(name) {
  return process.env[name] || envLocal[name] || "";
}

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_KEY = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "BLOCKED: .env.local no contiene NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
  process.exit(2);
}

function makeClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const results = [];
function record(name, passed, detail) {
  results.push({ name, passed, detail });
}

async function getAuthSettings() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: SUPABASE_KEY },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch /auth/v1/settings: HTTP ${res.status}`);
  }
  return res.json();
}

async function signInOrCreate(client, email, password, fullName, allowAutoSignup) {
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (!signIn.error && signIn.data.user && signIn.data.session) {
    return { user: signIn.data.user, mode: "existing" };
  }

  if (!allowAutoSignup) {
    throw new Error(
      `No fue posible iniciar sesión con la cuenta de prueba configurada (${signIn.error?.message ?? "sin sesión"}). Verifica que las cuentas TEST_USER_A_* y TEST_USER_B_* existan y estén confirmadas en Supabase Auth.`,
    );
  }

  const signUp = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUp.error || !signUp.data.session || !signUp.data.user) {
    throw new Error(
      `SignUp sin sesión activa: ${signUp.error?.message ?? "confirmación por correo requerida"}`,
    );
  }

  return { user: signUp.data.user, mode: "created" };
}

async function run() {
  const authSettings = await getAuthSettings();
  const mailerAutoConfirm = Boolean(authSettings.mailer_autoconfirm);

  const anonClient = makeClient();
  const clientA = makeClient();
  const clientB = makeClient();

  // 1. Anonymous visitor strictly denied on all 4 private tables (SELECT + INSERT)
  const anonDetails = [];
  let allAnonBlocked = true;
  for (const table of ["profiles", "categories", "transactions", "budgets"]) {
    const sel = await anonClient.from(table).select("id").limit(1);
    const blocked = Boolean(sel.error);
    if (!blocked) allAnonBlocked = false;
    anonDetails.push(`${table}:${sel.error?.code ?? "ALLOWED"}`);
  }
  record("anon-denied-all-4-tables", allAnonBlocked, anonDetails.join(", "));

  const configuredAEmail = getEnv("TEST_USER_A_EMAIL");
  const configuredAPass = getEnv("TEST_USER_A_PASSWORD");
  const configuredBEmail = getEnv("TEST_USER_B_EMAIL");
  const configuredBPass = getEnv("TEST_USER_B_PASSWORD");
  const hasExplicitUsers = Boolean(
    configuredAEmail && configuredAPass && configuredBEmail && configuredBPass,
  );

  if (!mailerAutoConfirm && !hasExplicitUsers) {
    console.log(
      JSON.stringify(
        {
          status: "BLOCKED_EMAIL_CONFIRMATION",
          mailerAutoConfirm,
          reason:
            "Confirm email está habilitado en Supabase Auth (mailer_autoconfirm=false) y no hay cuentas controladas TEST_USER_A_* / TEST_USER_B_* en .env.local. No se envían correos a direcciones ficticias no controladas.",
          results,
        },
        null,
        2,
      ),
    );
    process.exit(3);
  }

  const runTag = Date.now();
  const userAEmail = hasExplicitUsers
    ? configuredAEmail
    : `fintrack.qa.a.${runTag}@example.com`;
  const userAPass = hasExplicitUsers ? configuredAPass : `FTqaA#${runTag}x9`;
  const userBEmail = hasExplicitUsers
    ? configuredBEmail
    : `fintrack.qa.b.${runTag}@example.com`;
  const userBPass = hasExplicitUsers ? configuredBPass : `FTqaB#${runTag}y8`;

  const { user: userA, mode: modeA } = await signInOrCreate(
    clientA,
    userAEmail,
    userAPass,
    "Usuario Prueba A",
    mailerAutoConfirm && !hasExplicitUsers,
  );
  const { user: userB, mode: modeB } = await signInOrCreate(
    clientB,
    userBEmail,
    userBPass,
    "Usuario Prueba B",
    mailerAutoConfirm && !hasExplicitUsers,
  );
  record(
    "auth-two-independent-users",
    userA.id !== userB.id,
    `userA(${modeA}) != userB(${modeB})`,
  );

  // Track temporary resources to clean up cleanly in finally
  const cleanup = {
    txIdsA: [],
    budgetIdsA: [],
    catIdsA: [],
    originalNameA: null,
  };

  try {
    // 2. Profile auto-created + own read/update + cross-user profile isolation
    const { data: profA, error: profAErr } = await clientA
      .from("profiles")
      .select("id, full_name, currency, timezone")
      .eq("id", userA.id)
      .single();
    cleanup.originalNameA = profA?.full_name ?? "Usuario Prueba A";
    record(
      "auto-profile-created-and-readable",
      !profAErr &&
        profA?.currency === "USD" &&
        profA?.timezone === "America/El_Salvador",
      profAErr?.message ?? `currency=${profA?.currency}, tz=${profA?.timezone}`,
    );

    const editedName = `Usuario QA ${String(runTag).slice(-4)}`;
    const { data: profUpd, error: profUpdErr } = await clientA
      .from("profiles")
      .update({ full_name: editedName })
      .eq("id", userA.id)
      .select("full_name")
      .single();
    record(
      "profile-update-own",
      !profUpdErr && profUpd?.full_name === editedName,
      profUpdErr?.message ?? "OK",
    );

    const bReadsProfA = await clientB
      .from("profiles")
      .select("id, full_name")
      .eq("id", userA.id);
    const bUpdatesProfA = await clientB
      .from("profiles")
      .update({ full_name: "Hackeado por B" })
      .eq("id", userA.id)
      .select("id");
    const { data: verifyProfA } = await clientA
      .from("profiles")
      .select("full_name")
      .eq("id", userA.id)
      .single();
    record(
      "rls-profiles-isolation",
      (bReadsProfA.data?.length ?? 0) === 0 &&
        (bUpdatesProfA.data?.length ?? 0) === 0 &&
        verifyProfA?.full_name === editedName,
      `bRead=${bReadsProfA.data?.length ?? 0}, bUpd=${bUpdatesProfA.data?.length ?? 0}, intact=${verifyProfA?.full_name === editedName}`,
    );

    // 3. 12 default categories auto-seeded + clean start (0 fake transactions/budgets on fresh user)
    const { data: catsA } = await clientA.from("categories").select("*");
    const defaultCatsA = (catsA ?? []).filter((c) => c.is_default);
    const incomeDefaults = defaultCatsA.filter((c) => c.type === "income");
    const expenseDefaults = defaultCatsA.filter((c) => c.type === "expense");
    const defaultNames = new Set(defaultCatsA.map((c) => c.name));
    const utf8Clean =
      defaultNames.has("Alimentación") &&
      defaultNames.has("Educación") &&
      !defaultNames.has("AlimentaciÃ³n") &&
      !defaultNames.has("EducaciÃ³n");
    record(
      "auto-12-initial-categories-utf8",
      defaultCatsA.length === 12 &&
        incomeDefaults.length === 4 &&
        expenseDefaults.length === 8 &&
        utf8Clean,
      `defaults=${defaultCatsA.length} (income=${incomeDefaults.length}, expense=${expenseDefaults.length}, utf8Clean=${utf8Clean})`,
    );

    const { data: initialTxA } = await clientA.from("transactions").select("id");
    const { data: initialBudA } = await clientA.from("budgets").select("id");
    record(
      "new-user-starts-clean-no-demo-data",
      (initialTxA?.length ?? 0) === 0 && (initialBudA?.length ?? 0) === 0,
      `initialTx=${initialTxA?.length ?? 0}, initialBudgets=${initialBudA?.length ?? 0}`,
    );

    // 4. Positive CRUD on own custom category + cross-user category RLS + ownership transfer block
    const customCatName = `QA Cat ${runTag}`;
    const { data: createdCatA, error: createCatErr } = await clientA
      .from("categories")
      .insert({
        user_id: userA.id,
        name: customCatName,
        type: "expense",
        color: "#059669",
        icon: "tag",
        is_default: false,
      })
      .select("*")
      .single();
    if (createdCatA?.id) cleanup.catIdsA.push(createdCatA.id);

    const { data: updCatA, error: updCatErr } = await clientA
      .from("categories")
      .update({ color: "#0284C7" })
      .eq("id", createdCatA.id)
      .select("color")
      .single();
    record(
      "categories-own-insert-update",
      !createCatErr && !updCatErr && updCatA?.color === "#0284C7",
      createCatErr?.message ?? updCatErr?.message ?? "OK",
    );

    const bReadCatA = await clientB
      .from("categories")
      .select("id")
      .eq("id", createdCatA.id);
    const bUpdCatA = await clientB
      .from("categories")
      .update({ name: "Robada por B" })
      .eq("id", createdCatA.id)
      .select("id");
    const bDelCatA = await clientB
      .from("categories")
      .delete()
      .eq("id", createdCatA.id)
      .select("id");
    const bInsCatForA = await clientB.from("categories").insert({
      user_id: userA.id,
      name: `Injected ${runTag}`,
      type: "expense",
      color: "#DC5656",
      icon: "tag",
    });
    const aTransferCat = await clientA
      .from("categories")
      .update({ user_id: userB.id })
      .eq("id", createdCatA.id)
      .select("id");
    const { data: verifyCatA } = await clientA
      .from("categories")
      .select("name, user_id")
      .eq("id", createdCatA.id)
      .single();
    record(
      "rls-categories-isolation-and-no-transfer",
      (bReadCatA.data?.length ?? 0) === 0 &&
        (bUpdCatA.data?.length ?? 0) === 0 &&
        (bDelCatA.data?.length ?? 0) === 0 &&
        Boolean(bInsCatForA.error) &&
        Boolean(aTransferCat.error) &&
        verifyCatA?.name === customCatName &&
        verifyCatA?.user_id === userA.id,
      `bRead=0, bUpd=0, bDel=0, bInsErr=${bInsCatForA.error?.code}, transferErr=${aTransferCat.error?.code}`,
    );

    // 5. Monetary & Relational Constraints on Transactions
    const incomeCatA = incomeDefaults[0];
    const { data: catsB } = await clientB.from("categories").select("*");
    const expenseCatB = (catsB ?? []).find((c) => c.type === "expense");

    const zeroAmt = await clientA.from("transactions").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      type: "expense",
      amount_cents: 0,
      occurred_on: "2026-11-26",
      description: "Monto cero",
    });
    const negAmt = await clientA.from("transactions").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      type: "expense",
      amount_cents: -500,
      occurred_on: "2026-11-26",
      description: "Monto negativo",
    });
    const overLimitAmt = await clientA.from("transactions").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      type: "expense",
      amount_cents: 900_000_000_000_001,
      occurred_on: "2026-11-26",
      description: "Monto sobre límite seguro",
    });
    record(
      "constraints-reject-invalid-amounts",
      Boolean(zeroAmt.error) && Boolean(negAmt.error) && Boolean(overLimitAmt.error),
      `zero=${zeroAmt.error?.code}, neg=${negAmt.error?.code}, overMax=${overLimitAmt.error?.code}`,
    );

    const badTypeTx = await clientA.from("transactions").insert({
      user_id: userA.id,
      category_id: incomeCatA.id,
      type: "expense",
      amount_cents: 1500,
      occurred_on: "2026-11-26",
      description: "Tipo incompatible",
    });
    const foreignCatTx = await clientA.from("transactions").insert({
      user_id: userA.id,
      category_id: expenseCatB.id,
      type: "expense",
      amount_cents: 1500,
      occurred_on: "2026-11-26",
      description: "Categoría de usuario B",
    });
    record(
      "constraints-category-type-and-owner-fk",
      Boolean(badTypeTx.error) && Boolean(foreignCatTx.error),
      `badType=${badTypeTx.error?.code}, foreignCat=${foreignCatTx.error?.code}`,
    );

    // 6. Positive CRUD on own transaction + safe-delete linked category + cross-user RLS
    const { data: txA, error: txAErr } = await clientA
      .from("transactions")
      .insert({
        user_id: userA.id,
        category_id: createdCatA.id,
        type: "expense",
        amount_cents: 1999,
        occurred_on: "2026-11-26",
        description: "Compra prueba QA",
      })
      .select("*")
      .single();
    if (txA?.id) cleanup.txIdsA.push(txA.id);

    const { data: txAUpd, error: txAUpdErr } = await clientA
      .from("transactions")
      .update({ amount_cents: 2499, description: "Compra prueba QA editada" })
      .eq("id", txA.id)
      .select("amount_cents, description")
      .single();
    record(
      "transactions-own-insert-update",
      !txAErr && !txAUpdErr && txAUpd?.amount_cents === 2499,
      txAErr?.message ?? txAUpdErr?.message ?? "OK",
    );

    const delLinkedCatTx = await clientA
      .from("categories")
      .delete()
      .eq("id", createdCatA.id);
    record(
      "constraint-reject-delete-category-with-tx",
      Boolean(delLinkedCatTx.error),
      delLinkedCatTx.error?.code ?? "UNEXPECTED_OK",
    );

    const bReadTxA = await clientB.from("transactions").select("id").eq("id", txA.id);
    const bUpdTxA = await clientB
      .from("transactions")
      .update({ description: "Editada por B" })
      .eq("id", txA.id)
      .select("id");
    const bDelTxA = await clientB
      .from("transactions")
      .delete()
      .eq("id", txA.id)
      .select("id");
    const bInsTxForA = await clientB.from("transactions").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      type: "expense",
      amount_cents: 500,
      occurred_on: "2026-11-26",
      description: "Insertada en nombre de A",
    });
    const aTransferTx = await clientA
      .from("transactions")
      .update({ user_id: userB.id })
      .eq("id", txA.id)
      .select("id");
    const { data: verifyTxA } = await clientA
      .from("transactions")
      .select("description, amount_cents, user_id")
      .eq("id", txA.id)
      .single();
    record(
      "rls-transactions-isolation-and-no-transfer",
      (bReadTxA.data?.length ?? 0) === 0 &&
        (bUpdTxA.data?.length ?? 0) === 0 &&
        (bDelTxA.data?.length ?? 0) === 0 &&
        Boolean(bInsTxForA.error) &&
        Boolean(aTransferTx.error) &&
        verifyTxA?.description === "Compra prueba QA editada" &&
        verifyTxA?.user_id === userA.id,
      `bRead=0, bUpd=0, bDel=0, bInsErr=${bInsTxForA.error?.code}, transferErr=${aTransferTx.error?.code}`,
    );

    // 7. Budgets constraints + own CRUD + cross-user RLS + safe-delete
    const incomeBudget = await clientA.from("budgets").insert({
      user_id: userA.id,
      category_id: incomeCatA.id,
      month: "2026-11-01",
      limit_cents: 50_000,
    });
    const badMonthBudget = await clientA.from("budgets").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      month: "2026-11-15",
      limit_cents: 50_000,
    });
    const { data: budA, error: budAErr } = await clientA
      .from("budgets")
      .insert({
        user_id: userA.id,
        category_id: createdCatA.id,
        month: "2026-11-01",
        limit_cents: 50_000,
      })
      .select("*")
      .single();
    if (budA?.id) cleanup.budgetIdsA.push(budA.id);

    const dupBudget = await clientA.from("budgets").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      month: "2026-11-01",
      limit_cents: 60_000,
    });
    record(
      "constraints-budgets-expense-only-first-day-unique",
      Boolean(incomeBudget.error) &&
        Boolean(badMonthBudget.error) &&
        !budAErr &&
        Boolean(dupBudget.error),
      `incomeErr=${incomeBudget.error?.code}, badDayErr=${badMonthBudget.error?.code}, dupErr=${dupBudget.error?.code}`,
    );

    const { data: budAUpd, error: budAUpdErr } = await clientA
      .from("budgets")
      .update({ limit_cents: 55_000 })
      .eq("id", budA.id)
      .select("limit_cents")
      .single();
    record(
      "budgets-own-update",
      !budAUpdErr && budAUpd?.limit_cents === 55_000,
      budAUpdErr?.message ?? "OK",
    );

    const bReadBudA = await clientB.from("budgets").select("id").eq("id", budA.id);
    const bUpdBudA = await clientB
      .from("budgets")
      .update({ limit_cents: 100 })
      .eq("id", budA.id)
      .select("id");
    const bDelBudA = await clientB
      .from("budgets")
      .delete()
      .eq("id", budA.id)
      .select("id");
    const bInsBudForA = await clientB.from("budgets").insert({
      user_id: userA.id,
      category_id: createdCatA.id,
      month: "2026-12-01",
      limit_cents: 10_000,
    });
    const aTransferBud = await clientA
      .from("budgets")
      .update({ user_id: userB.id })
      .eq("id", budA.id)
      .select("id");
    const { data: verifyBudA } = await clientA
      .from("budgets")
      .select("limit_cents, user_id")
      .eq("id", budA.id)
      .single();
    record(
      "rls-budgets-isolation-and-no-transfer",
      (bReadBudA.data?.length ?? 0) === 0 &&
        (bUpdBudA.data?.length ?? 0) === 0 &&
        (bDelBudA.data?.length ?? 0) === 0 &&
        Boolean(bInsBudForA.error) &&
        Boolean(aTransferBud.error) &&
        verifyBudA?.limit_cents === 55_000 &&
        verifyBudA?.user_id === userA.id,
      `bRead=0, bUpd=0, bDel=0, bInsErr=${bInsBudForA.error?.code}, transferErr=${aTransferBud.error?.code}`,
    );

    // 8. Positive DELETE of own transaction, budget, and then unlinked custom category
    const delTxA = await clientA.from("transactions").delete().eq("id", txA.id);
    const delBudA = await clientA.from("budgets").delete().eq("id", budA.id);
    const delCatA = await clientA.from("categories").delete().eq("id", createdCatA.id);
    cleanup.txIdsA = [];
    cleanup.budgetIdsA = [];
    cleanup.catIdsA = [];
    record(
      "own-delete-tx-budget-and-unlinked-category",
      !delTxA.error && !delBudA.error && !delCatA.error,
      delTxA.error?.message ?? delBudA.error?.message ?? delCatA.error?.message ?? "OK",
    );
  } finally {
    // Best-effort cleanup of any leftover test rows
    for (const id of cleanup.txIdsA) {
      await clientA.from("transactions").delete().eq("id", id);
    }
    for (const id of cleanup.budgetIdsA) {
      await clientA.from("budgets").delete().eq("id", id);
    }
    for (const id of cleanup.catIdsA) {
      await clientA.from("categories").delete().eq("id", id);
    }
    if (cleanup.originalNameA) {
      await clientA
        .from("profiles")
        .update({ full_name: cleanup.originalNameA })
        .eq("id", userA.id);
    }
  }

  console.log(
    JSON.stringify(
      {
        status: results.every((r) => r.passed) ? "PASSED" : "FAILED",
        mailerAutoConfirm,
        totalChecks: results.length,
        passedChecks: results.filter((r) => r.passed).length,
        results,
      },
      null,
      2,
    ),
  );

  if (results.some((r) => !r.passed)) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
