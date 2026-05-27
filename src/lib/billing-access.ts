import type { SupabaseClient } from "@supabase/supabase-js";

import { isCreditSchemaMissing } from "@/lib/billing";
import type { Database } from "@/lib/supabase/types";

export async function getIdeaBuildPassAccess(supabase: SupabaseClient<Database>, ideaId: string) {
  const { data, error } = await supabase
    .from("idea_build_passes")
    .select("idea_id")
    .eq("idea_id", ideaId)
    .maybeSingle();

  if (error) {
    if (isCreditSchemaMissing(error)) {
      return {
        status: "missing" as const,
        hasPass: true,
        required: false,
        message: "Credit ledger migration is not applied yet; preserving the existing build flow.",
      };
    }

    return {
      status: "unavailable" as const,
      hasPass: false,
      required: true,
      message: `Could not verify production package unlock: ${error.message}`,
    };
  }

  return {
    status: "ready" as const,
    hasPass: Boolean(data),
    required: true,
    message: data ? null : "Production package unlock is required before external tool connection.",
  };
}
