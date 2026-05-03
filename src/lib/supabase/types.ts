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
export type OrganizationRole = "owner" | "admin" | "member" | "viewer";

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
          organization_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ideas"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["ideas"]["Row"]>;
        Relationships: [];
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
          organization_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["risks"]["Row"]> & {
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["risks"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "risks_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
        ];
      };
      decisions: {
        Row: {
          id: string;
          idea_id: string | null;
          decision: DecisionStatus;
          reason: string;
          organization_id: string | null;
          created_by: string | null;
          decided_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["decisions"]["Row"]> & {
          decision: DecisionStatus;
        };
        Update: Partial<Database["public"]["Tables"]["decisions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "decisions_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
        ];
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
          organization_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["experiments"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["experiments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "experiments_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          organization_id: string;
          user_id: string;
          role: OrganizationRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organization_members"]["Row"]> & {
          organization_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_events: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          entity_table: string;
          entity_id: string | null;
          action: string;
          summary: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_events"]["Row"]> & {
          entity_table: string;
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_events"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      default_organization_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_organization_admin: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      is_organization_member: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      idea_stage: IdeaStage;
      decision_status: DecisionStatus;
      risk_severity: RiskSeverity;
      organization_role: OrganizationRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
