import { Info } from "lucide-react";

interface DemoNoticeProps {
  text?: string;
}

export function DemoNotice({
  text = "Vista preliminar de Fase 02 con datos de demostración coherentes. La autenticación real y persistencia en Supabase se integrarán en las Fases 03 y 04.",
}: DemoNoticeProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-brand-dark"
    >
      <Info
        className="mt-0.5 size-4 shrink-0 text-success-text"
        aria-hidden="true"
      />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
