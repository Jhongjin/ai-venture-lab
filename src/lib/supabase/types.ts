export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type IdeaStage =
  | "intake"
  | "research"
  | "score"
  | "prd"
  | "prototype"
  | "qa"
  | "launch"
  | "paused";

export type DecisionStatus = "ship" | "pivot" | "kill" | "research_more" | "pending";
export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type Database = {
  public: {
    Tables: {
      ideas: {
        Row: {
          id: string;
          name: string;
          one_liner: string;
          target_user: string;
          buyer: string;
          stage: IdeaStage;
          decision: DecisionStatus;
          problem_intensity: number;
          frequency: number;
          reachability: number;
          willingness_to_pay: number;
          mvp_speed: number;
          differentiation: number;
          regulatory_risk: number;
          signal: string;
          risk_summary: string;
          next_evidence: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ideas"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["ideas"]["Row"]>;
      };
      risks: {
        Row: {
          id: string;
          idea_id: string | null;
          title: string;
          area: string;
          severity: RiskSeverity;
          mitigation: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["risks"]["Row"]> & {
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["risks"]["Row"]>;
      };
      decisions: {
        Row: {
          id: string;
          idea_id: string | null;
          decision: DecisionStatus;
          reason: string;
          decided_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["decisions"]["Row"]> & {
          decision: DecisionStatus;
        };
        Update: Partial<Database["public"]["Tables"]["decisions"]["Row"]>;
      };
      experiments: {
        Row: {
          id: string;
          idea_id: string | null;
          name: string;
          status: string;
          success_metric: string;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["experiments"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["experiments"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      idea_stage: IdeaStage;
      decision_status: DecisionStatus;
      risk_severity: RiskSeverity;
    };
    CompositeTypes: Record<string, never>;
  };
};
