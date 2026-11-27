import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Lock,
  PieChart,
  ShieldCheck,
  Tags,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { MoneyDisplay } from "@/components/shared/money-display";
import {
  DEMO_ACTIVE_MONTH,
  getDemoBudgetSummaries,
  getDemoPeriodMetrics,
} from "@/lib/demo-data";
import { formatDateShort, formatMonthLabel } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Wallet,
    title: "Control de ingresos y gastos",
    description:
      "Registra cada movimiento en dólares con fecha calendario exacta, búsqueda rápida y filtros combinables por tipo, categoría y período.",
  },
  {
    icon: PieChart,
    title: "Gestión de presupuestos mensuales",
    description:
      "Asigna límites por categoría de gasto y visualiza el avance automático con avisos preventivos antes de superar tu presupuesto.",
  },
  {
    icon: Tags,
    title: "Categorización flexible",
    description:
      "Parte de categorías esenciales listas para usar y crea las tuyas con colores e iconos propios, protegiendo siempre el historial asociado.",
  },
  {
    icon: BarChart3,
    title: "Reportes y exportación CSV",
    description:
      "Compara meses, analiza la evolución de tu flujo de efectivo y descarga tus registros filtrados en CSV para respaldo o análisis externo.",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Registra tus movimientos",
    description:
      "Ingresa tus ingresos y gastos en segundos con validación inmediata de importes exactos en centavos y sin complicaciones innecesarias.",
  },
  {
    step: "02",
    title: "Organiza tus finanzas",
    description:
      "Clasifica cada transacción en categorías personalizadas y define techos de gasto mensuales que se actualizan automáticamente.",
  },
  {
    step: "03",
    title: "Visualiza tus resultados",
    description:
      "Consulta tu balance acumulado, detecta a tiempo desvíos en presupuestos y exporta reportes claros para tomar mejores decisiones.",
  },
] as const;

const SECURITY_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Sin acceso a tus cuentas bancarias",
    status: "Enfoque de producto",
    description:
      "FinTrack no solicita credenciales bancarias, números de tarjeta ni realiza cobros. Tú decides exactamente qué movimientos registrar.",
  },
  {
    icon: Database,
    title: "Precisión contable en centavos enteros",
    status: "Implementado",
    description:
      "Cada importe se procesa en centavos enteros seguros para eliminar errores de redondeo y mantener consistencia total entre reportes y presupuestos.",
  },
  {
    icon: Lock,
    title: "Sesiones en servidor y aislamiento por usuario",
    status: "Implementado (Fase 03)",
    description:
      "Sesiones HTTP gestionadas con Supabase SSR, validación estricta con Zod, protección de rutas en servidor y migraciones PostgreSQL con Row Level Security.",
  },
] as const;

export default function LandingPage() {
  const metrics = getDemoPeriodMetrics(DEMO_ACTIVE_MONTH);
  const budgets = getDemoBudgetSummaries(DEMO_ACTIVE_MONTH).slice(0, 3);
  const monthLabel = formatMonthLabel(DEMO_ACTIVE_MONTH);

  return (
    <main>
      {/* Hero Section */}
      <section className="border-b border-border/80 bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="min-w-0 space-y-6">
            <Badge
              variant="outline"
              className="h-auto max-w-full whitespace-normal gap-1.5 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-success-text"
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-brand-primary"
              />
              Finanzas personales en USD · Control mensual
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight text-brand-dark sm:text-5xl lg:leading-[1.1]">
              Tus finanzas personales, con orden y control real cada mes.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              FinTrack centraliza tus ingresos, gastos, categorías y
              presupuestos mensuales en un espacio claro y sobrio, para que
              sepas exactamente adónde va tu dinero sin hojas de cálculo
              dispersas.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-11 px-5 text-sm font-medium",
                )}
              >
                Comenzar ahora
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/#funcionalidades"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-5 text-sm font-medium",
                )}
              >
                Ver funcionalidades
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-success-text"
                  aria-hidden="true"
                />
                Importes exactos en USD
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-success-text"
                  aria-hidden="true"
                />
                Presupuestos con alertas de límite
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-success-text"
                  aria-hidden="true"
                />
                Exportación a CSV
              </span>
            </div>
          </div>

          {/* Custom Dashboard Preview built from real coherent demo data */}
          <div className="min-w-0 rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3.5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Vista previa · {monthLabel}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  Resumen financiero
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Crear cuenta
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Balance & KPIs */}
            <div className="mt-4 rounded-xl bg-brand-dark p-4 text-white">
              <p className="text-xs font-medium text-emerald-100/80">
                Balance acumulado (datos de demostración)
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
                {formatCurrency(metrics.accumulatedBalanceCents)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/12 pt-3">
                <div>
                  <p className="text-[11px] text-emerald-100/75">
                    Ingresos del mes
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-brand-accent">
                    +{formatCurrency(metrics.periodIncomeCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-emerald-100/75">
                    Gastos del mes
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-red-300">
                    -{formatCurrency(metrics.periodExpenseCents)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mini Budget Trackers */}
            <div className="mt-4 rounded-xl border border-border bg-card p-3.5">
              <p className="text-xs font-semibold text-foreground">
                Presupuestos activos
              </p>
              <div className="mt-3 space-y-3">
                {budgets.map((budget) => (
                  <div key={budget.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {budget.category.name}
                      </span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(budget.spentCents)} /{" "}
                        {formatCurrency(budget.limitCents)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          budget.status === "exceeded" && "bg-danger",
                          budget.status === "warning" && "bg-warning",
                          budget.status === "healthy" && "bg-brand-primary",
                        )}
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Demo Transactions */}
            <div className="mt-4 rounded-xl border border-border bg-card p-3.5">
              <p className="text-xs font-semibold text-foreground">
                Movimientos recientes
              </p>
              <ul className="mt-2.5 divide-y divide-border/70">
                {metrics.recentTransactions.slice(0, 3).map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <CategoryIcon
                        icon={tx.category.icon}
                        color={tx.category.color}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">
                          {tx.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {tx.category.name} · {formatDateShort(tx.occurredOn)}
                        </p>
                      </div>
                    </div>
                    <MoneyDisplay
                      cents={tx.amountCents}
                      tone={tx.type === "income" ? "income" : "expense"}
                      className="shrink-0 text-xs font-semibold"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section
        id="funcionalidades"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20"
      >
        <div className="max-w-2xl space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-success-text">
            Funcionalidades principales
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Todo lo esencial para llevar tus finanzas personales al día
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cada módulo está diseñado para resolver una tarea concreta sin
            pantallas sobrecargadas ni funciones accesorias que distraigan.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="border-border/80 bg-card shadow-none transition-colors hover:border-emerald-300/80"
              >
                <CardContent className="flex h-full flex-col gap-3.5 p-6">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-success-text"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="scroll-mt-20 border-y border-border/80 bg-card"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-success-text">
              Flujo de trabajo
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Tres pasos simples para mantener el control
            </h2>
          </div>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-xl border border-border bg-background p-6"
              >
                <span className="font-mono text-xs font-semibold tracking-widest text-success-text">
                  PASO {item.step}
                </span>
                <h3 className="mt-2.5 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Security & Privacy */}
      <section
        id="seguridad"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20"
      >
        <div className="max-w-2xl space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-success-text">
            Seguridad y privacidad
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Diseñado para proteger tu información con transparencia
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Priorizamos buenas prácticas verificables y transparencia técnica
            sobre el estado real de cada capa del sistema.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SECURITY_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-border/80 bg-card shadow-none"
              >
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-dark text-brand-accent"
                    >
                      <Icon className="size-5" />
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-medium text-muted-foreground"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="rounded-2xl bg-brand-dark px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-accent">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              FinTrack · Tus finanzas, bajo control
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Empieza a ordenar tus ingresos, gastos y presupuestos hoy
            </h2>
            <p className="text-sm leading-relaxed text-emerald-100/80 sm:text-base">
              Explora la interfaz de FinTrack o prepara tu registro para llevar
              un seguimiento mensual claro y sin fricción.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 bg-brand-accent px-5 text-sm font-semibold text-brand-dark hover:bg-emerald-300",
              )}
            >
              Crear cuenta
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 border-white/25 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
