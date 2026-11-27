"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatExactCurrency } from "@/lib/money";
import type {
  CategoryExpensePoint,
  ExactCategoryExpensePoint,
  ExactMonthlyCashflowPoint,
  MonthlyCashflowPoint,
} from "@/types/domain";

const COMPACT_USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatTooltipCurrency(value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0.00";
  return formatCurrency(Math.round(numeric));
}

function formatAxisCurrency(value: number): string {
  return formatCurrency(Math.round(value), { compact: true });
}

function formatAxisDollars(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  return COMPACT_USD_FORMATTER.format(value);
}

interface CashflowBarChartProps {
  data: MonthlyCashflowPoint[];
  height?: number;
}

export function CashflowBarChart({
  data,
  height = 280,
}: CashflowBarChartProps) {
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisCurrency}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              formatTooltipCurrency(value),
              name === "incomeCents" ? "Ingresos" : "Gastos",
            ]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              borderRadius: "10px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
            }}
          />
          <Bar
            dataKey="incomeCents"
            name="incomeCents"
            fill="#059669"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="expenseCents"
            name="expenseCents"
            fill="#DC5656"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface NetFlowAreaChartProps {
  data: MonthlyCashflowPoint[];
  height?: number;
}

export function NetFlowAreaChart({
  data,
  height = 260,
}: NetFlowAreaChartProps) {
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="fintrackNetGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisCurrency}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [formatTooltipCurrency(value), "Flujo neto"]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="netCents"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#fintrackNetGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ExpenseCategoryChartProps {
  data: CategoryExpensePoint[];
  height?: number;
}

export function ExpenseCategoryChart({
  data,
  height = 240,
}: ExpenseCategoryChartProps) {
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,220px)_1fr]">
      <div style={{ height }} className="w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amountCents"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatTooltipCurrency(value),
                String(name),
              ]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E2E8F0",
                borderRadius: "10px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2.5 text-sm">
        {data.slice(0, 6).map((item) => (
          <li
            key={item.categoryId}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-foreground">{item.name}</span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {formatCurrency(item.amountCents)} · {item.percentage.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================================
 * ADR-011 Exact Charts: plot finite USD projections, render exact BigInt cents
 * ============================================================================ */

interface ExactCashflowBarChartProps {
  data: ExactMonthlyCashflowPoint[];
  height?: number;
}

export function ExactCashflowBarChart({
  data,
  height = 280,
}: ExactCashflowBarChartProps) {
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisDollars}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0]
                ?.payload as ExactMonthlyCashflowPoint | undefined;
              if (!point) return null;
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
                  <p className="mb-1.5 font-semibold text-foreground">
                    {label}
                  </p>
                  <div className="space-y-1 font-mono tabular-nums">
                    <p className="flex items-center justify-between gap-4 text-success-text">
                      <span className="font-sans text-muted-foreground">
                        Ingresos
                      </span>
                      <span>{formatExactCurrency(point.incomeCents)}</span>
                    </p>
                    <p className="flex items-center justify-between gap-4 text-danger-text">
                      <span className="font-sans text-muted-foreground">
                        Gastos
                      </span>
                      <span>{formatExactCurrency(point.expenseCents)}</span>
                    </p>
                    <p className="flex items-center justify-between gap-4 border-t border-border/60 pt-1 text-foreground">
                      <span className="font-sans text-muted-foreground">
                        Neto
                      </span>
                      <span>
                        {formatExactCurrency(point.netCents, {
                          showSign: true,
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="chartIncome"
            name="Ingresos"
            fill="#059669"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
          />
          <Bar
            dataKey="chartExpense"
            name="Gastos"
            fill="#DC5656"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ExactNetFlowAreaChartProps {
  data: ExactMonthlyCashflowPoint[];
  height?: number;
}

export function ExactNetFlowAreaChart({
  data,
  height = 260,
}: ExactNetFlowAreaChartProps) {
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="fintrackExactNetGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisDollars}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0]
                ?.payload as ExactMonthlyCashflowPoint | undefined;
              if (!point) return null;
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
                  <p className="mb-1 font-semibold text-foreground">{label}</p>
                  <p className="font-mono tabular-nums text-foreground">
                    Flujo neto:{" "}
                    {formatExactCurrency(point.netCents, { showSign: true })}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="chartNet"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#fintrackExactNetGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ExactExpenseCategoryChartProps {
  data: ExactCategoryExpensePoint[];
  height?: number;
}

export function ExactExpenseCategoryChart({
  data,
  height = 240,
}: ExactExpenseCategoryChartProps) {
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,220px)_1fr]">
      <div style={{ height }} className="w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="chartAmount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]
                  ?.payload as ExactCategoryExpensePoint | undefined;
                if (!item) return null;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="font-mono tabular-nums text-muted-foreground">
                      {formatExactCurrency(item.amountCents)} ·{" "}
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2.5 text-sm">
        {data.slice(0, 6).map((item) => (
          <li
            key={item.categoryId}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-foreground">{item.name}</span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {formatExactCurrency(item.amountCents)} ·{" "}
              {item.percentage.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
