"use client";

import { Clock } from "@phosphor-icons/react";
import type { Database } from "@/lib/supabase/types";

type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];

type VentureConsoleWorkspaceAuditLogProps = {
  auditEvents: AuditEvent[];
};

export function VentureConsoleWorkspaceAuditLog({ auditEvents }: VentureConsoleWorkspaceAuditLogProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Clock size={16} />
        최근 감사 로그
      </div>
      <div className="grid gap-2">
        {auditEvents.length > 0 ? (
          auditEvents.map((event) => (
            <div key={event.id} className="avl-surface-muted p-3 text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-950">{event.action}</span> {event.summary}
            </div>
          ))
        ) : (
          <div className="avl-surface-muted p-3 text-sm text-slate-500">아직 조직 감사 로그가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
