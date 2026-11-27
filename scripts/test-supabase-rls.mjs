/**
 * Real Supabase Auth + PostgreSQL Constraints + 2-User RLS Isolation Suite.
 *
 * Uses ONLY NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * from .env.local (NEVER service_role). Creates two controlled disposable test
 * users (when email confirmation is disabled or pre-confirmed test credentials
 * are supplied via env vars) and validates all 18 Phase 03 DB/RLS requirements.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return {};
  }
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
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || envLocal.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  envLocal.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

async function ensureSignedInUser(client, email, password, fullName) {
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (!signIn.error && signIn.data.user) {
    return { user: signIn.data.user, mode: "existing" };
  }

  const signUp = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUp.error) {
    throw new Error(`SignUp failed for ${email}: ${signUp.error.message}`);
  }
  if (!signUp.data.session || !signUp.data.user) {
    throw new Error(
      `SignUp created user ${email} without session (email confirmation is enabled in Supabase Auth). Confirm the test users or pass confirmed TEST_USER_A_* / TEST_USER_B_* env vars.`,
    );
  }
  return { user: signUp.data.user, mode: "created" };
}

async function run() {
  const runTag = Date.now();
  const userAEmail =
    process.env.TEST_USER_A_EMAIL || `fintrack.qa.a.${runTag}@example.com`;
  const userAPass = process.env.TEST_USER_A_PASSWORD || "FinTrackQA2026!";
  const userBEmail =
    process.env.TEST_USER_B_EMAIL || `fintrack.qa.b.${runTag}@example.com`;
  const userBPass = process.env.TEST_USER_B_PASSWORD || "FinTrackQA2026!";

  const anonClient = makeClient();
  const clientA = makeClient();
  const clientB = makeClient();

  // 1. Anonymous visitor cannot read any private table
  const anonTx = await anonClient.from("transactions").select("id").limit(1);
  const anonCat = await anonClient.from("categories").select("id").limit(1);
  const anonProf = await anonClient.from("profiles").select("id").limit(1);
  const anonBlocked =
    Boolean(anonTx.error || (anonTx.data?.length ?? 0) === 0) &&
    Boolean(anonCat.error || (anonCat.data?.length ?? 0) === 0) &&
    Boolean(anonProf.error || (anonProf.data?.length ?? 0) === 0);
  record(
    "anon-cannot-read-private-tables",
    anonBlocked,
    `txErr=${anonTx.error?.code ?? "none"}, catErr=${anonCat.error?.code ?? "none"}, profErr=${anonProf.error?.code ?? "none"}`,
  );

  // 2. Authenticate User A & User B
  const { user: userA } = await ensureSignedInUser(
    clientA,
    userAEmail,
    userAPass,
    "Usuario Prueba A",
  );
  await ensureSignedInUser(
    clientB,
    userBEmail,
    userBPass,
    "Usuario Prueba B",
  );
  record("register-and-signin-two-users", true, "User A & User B active");

  // 3. Auto-created profile & 12 initial categories for User A
  const { data: profA } = await clientA
    .from("profiles")
    .select("*")
    .eq("id", userA.id)
    .single();
  record(
    "auto-profile-created",
    Boolean(profA && profA.currency === "USD" && profA.timezone === "America/El_Salvador"),
    `full_name=${profA?.full_name ?? "missing"}`,
  );

  const { data: catsA } = await clientA.from("categories").select("*");
  const incomeCatsA = (catsA ?? []).filter((c) => c.type === "income");
  const expenseCatsA = (catsA ?? []).filter((c) => c.type === "expense");
  record(
    "auto-12-initial-categories",
    (catsA?.length ?? 0) >= 12 &&
      incomeCatsA.length >= 4 &&
      expenseCatsA.length >= 8,
    `total=${catsA?.length ?? 0}, income=${incomeCatsA.length}, expense=${expenseCatsA.length}`,
  );

  // 4. Profile update works for own profile
  const { data: updatedProfA, error: profUpdErr } = await clientA
    .from("profiles")
    .update({ full_name: "Usuario Prueba A Editado" })
    .eq("id", userA.id)
    .select()
    .single();
  record(
    "profile-update-own",
    !profUpdErr && updatedProfA?.full_name === "Usuario Prueba A Editado",
    profUpdErr?.message ?? "OK",
  );

  const expenseCatA = expenseCatsA[0];
  const incomeCatA = incomeCatsA[0];
  const { data: catsB } = await clientB.from("categories").select("*");
  const expenseCatB = (catsB ?? []).find((c) => c.type === "expense");

  // 5. Reject invalid monetary amount (<= 0)
  const badAmt = await clientA.from("transactions").insert({
    user_id: userA.id,
    category_id: expenseCatA.id,
    type: "expense",
    amount_cents: 0,
    occurred_on: "2026-11-26",
    description: "Monto inválido cero",
  });
  record("reject-non-positive-amount", Boolean(badAmt.error), badAmt.error?.code ?? "UNEXPECTED_OK");

  // 6. Reject incompatible category-transaction type
  const badType = await clientA.from("transactions").insert({
    user_id: userA.id,
    category_id: incomeCatA.id,
    type: "expense",
    amount_cents: 1500,
    occurred_on: "2026-11-26",
    description: "Tipo incompatible",
  });
  record("reject-incompatible-category-type", Boolean(badType.error), badType.error?.code ?? "UNEXPECTED_OK");

  // 7. Reject transaction using User B's category
  const crossCatTx = await clientA.from("transactions").insert({
    user_id: userA.id,
    category_id: expenseCatB.id,
    type: "expense",
    amount_cents: 2500,
    occurred_on: "2026-11-26",
    description: "Categoría ajena",
  });
  record("reject-foreign-user-category", Boolean(crossCatTx.error), crossCatTx.error?.code ?? "UNEXPECTED_OK");

  // 8. Insert valid transaction for User A & verify safe-delete blocks deleting linked category
  const validTx = await clientA
    .from("transactions")
    .insert({
      user_id: userA.id,
      category_id: expenseCatA.id,
      type: "expense",
      amount_cents: 1999,
      occurred_on: "2026-11-26",
      description: "Prueba integridad transacción A",
    })
    .select()
    .single();
  record("insert-valid-transaction", !validTx.error && Boolean(validTx.data?.id), validTx.error?.message ?? "OK");

  const delLinkedCat = await clientA
    .from("categories")
    .delete()
    .eq("id", expenseCatA.id);
  record(
    "reject-delete-linked-category",
    Boolean(delLinkedCat.error),
    delLinkedCat.error?.code ?? "UNEXPECTED_OK",
  );

  // 9. Reject budget on income category
  const incomeBudget = await clientA.from("budgets").insert({
    user_id: userA.id,
    category_id: incomeCatA.id,
    month: "2026-11-01",
    limit_cents: 50000,
  });
  record(
    "reject-budget-on-income-category",
    Boolean(incomeBudget.error),
    incomeBudget.error?.code ?? "UNEXPECTED_OK",
  );

  // 10. Insert valid budget & reject duplicate for same user/category/month
  const validBudget = await clientA
    .from("budgets")
    .insert({
      user_id: userA.id,
      category_id: expenseCatA.id,
      month: "2026-11-01",
      limit_cents: 50000,
    })
    .select()
    .single();
  const dupBudget = await clientA.from("budgets").insert({
    user_id: userA.id,
    category_id: expenseCatA.id,
    month: "2026-11-01",
    limit_cents: 60000,
  });
  record(
    "reject-duplicate-monthly-budget",
    !validBudget.error && Boolean(dupBudget.error),
    dupBudget.error?.code ?? "UNEXPECTED_OK",
  );

  // 11. RLS Isolation: User B cannot SELECT, UPDATE, DELETE, or INSERT on behalf of User A
  const txAId = validTx.data.id;
  const bReadsA = await clientB
    .from("transactions")
    .select("*")
    .eq("id", txAId);
  const bUpdatesA = await clientB
    .from("transactions")
    .update({ description: "Intento modificación cruzada" })
    .eq("id", txAId)
    .select();
  const bDeletesA = await clientB
    .from("transactions")
    .delete()
    .eq("id", txAId)
    .select();
  const bInsertsForA = await clientB.from("transactions").insert({
    user_id: userA.id,
    category_id: expenseCatA.id,
    type: "expense",
    amount_cents: 500,
    occurred_on: "2026-11-26",
    description: "Intento inserción en nombre de A",
  });

  record(
    "rls-user-b-cannot-read-a",
    (bReadsA.data?.length ?? 0) === 0,
    `rows=${bReadsA.data?.length ?? 0}`,
  );
  record(
    "rls-user-b-cannot-update-a",
    (bUpdatesA.data?.length ?? 0) === 0,
    `rows=${bUpdatesA.data?.length ?? 0}`,
  );
  record(
    "rls-user-b-cannot-delete-a",
    (bDeletesA.data?.length ?? 0) === 0,
    `rows=${bDeletesA.data?.length ?? 0}`,
  );
  record(
    "rls-user-b-cannot-insert-for-a",
    Boolean(bInsertsForA.error),
    bInsertsForA.error?.code ?? "UNEXPECTED_OK",
  );

  // Clean up User A's test transaction & budget
  await clientA.from("transactions").delete().eq("id", txAId);
  if (validBudget.data?.id) {
    await clientA.from("budgets").delete().eq("id", validBudget.data.id);
  }

  console.log(JSON.stringify({ results }, null, 2));
  if (results.some((r) => !r.passed)) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
