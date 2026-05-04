"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Building2, Clock3, LogIn, LogOut, PlusCircle, RefreshCw, ShieldCheck, Trash2, Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, OrganizationRole } from "@/lib/supabase/types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];
type AddableOrganizationRole = Extract<OrganizationRole, "admin" | "member" | "viewer">;

type FormState = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  signal: string;
  risk_summary: string;
  next_evidence: string;
};

const emptyForm: FormState = {
  name: "",
  one_liner: "",
  target_user: "",
  buyer: "",
  signal: "",
  risk_summary: "",
  next_evidence: "",
};

const memberRoles: AddableOrganizationRole[] = ["member", "viewer", "admin"];
const workspaceRecordTables = [
  "ideas",
  "risks",
  "decisions",
  "experiments",
  "orchestration_runs",
  "venture_artifacts",
] as const;

export function VentureConsoleActions() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(() => !supabase);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<AddableOrganizationRole>("member");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWorkspaceBusy, setIsWorkspaceBusy] = useState(false);
  const [isMemberBusy, setIsMemberBusy] = useState(false);
  const [memberActionKey, setMemberActionKey] = useState<string | null>(null);
  const [personalRecordCount, setPersonalRecordCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);

  const activeOrganization = useMemo(
    () => organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations[0] ?? null,
    [activeOrganizationId, organizations],
  );
  const activeMembership = useMemo(
    () => members.find((member) => member.organization_id === activeOrganization?.id && member.user_id === user?.id) ?? null,
    [activeOrganization?.id, members, user?.id],
  );
  const activeMemberCount = useMemo(
    () => members.filter((member) => member.organization_id === activeOrganization?.id).length,
    [activeOrganization?.id, members],
  );
  const activeMembers = useMemo(
    () => members.filter((member) => member.organization_id === activeOrganization?.id),
    [activeOrganization?.id, members],
  );
  const canManageMembers = activeMembership?.role === "owner" || activeMembership?.role === "admin";
  const ownerCount = useMemo(
    () => activeMembers.filter((member) => member.role === "owner").length,
    [activeMembers],
  );

  const loadPersonalRecordCount = useCallback(
    async (operator: User | null) => {
      if (!supabase || !operator) {
        setPersonalRecordCount(0);
        return;
      }

      const results = await Promise.all(
        workspaceRecordTables.map((table) =>
          supabase
            .from(table)
            .select("id", { count: "exact", head: true })
            .eq("created_by", operator.id)
            .is("organization_id", null),
        ),
      );

      setPersonalRecordCount(results.reduce((sum, result) => sum + (result.count ?? 0), 0));
    },
    [supabase],
  );

  const loadAuditEvents = useCallback(
    async (organizationId: string) => {
      if (!supabase || !organizationId) {
        setAuditEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        setWorkspaceMessage(error.message);
        return;
      }

      setAuditEvents(data ?? []);
    },
    [supabase],
  );

  const loadWorkspaceData = useCallback(async (operator: User | null, preferredOrganizationId = "") => {
    if (!supabase || !operator) {
      setOrganizations([]);
      setMembers([]);
      setAuditEvents([]);
      setActiveOrganizationId("");
      setPersonalRecordCount(0);
      return;
    }

    const [organizationsResult, membersResult] = await Promise.all([
      supabase.from("organizations").select("*").order("created_at", { ascending: true }),
      supabase.from("organization_members").select("*").order("created_at", { ascending: true }),
    ]);

    if (organizationsResult.error || membersResult.error) {
      setWorkspaceMessage(
        organizationsResult.error?.message ?? membersResult.error?.message ?? "Workspace data could not be loaded.",
      );
      return;
    }

    const nextOrganizations = organizationsResult.data ?? [];
    const nextMembers = membersResult.data ?? [];
    const nextActiveId = preferredOrganizationId || nextOrganizations[0]?.id || "";

    setOrganizations(nextOrganizations);
    setMembers(nextMembers);
    setActiveOrganizationId(nextActiveId);

    if (!nextActiveId) {
      setAuditEvents([]);
      await loadPersonalRecordCount(operator);
      return;
    }

    await loadAuditEvents(nextActiveId);
    await loadPersonalRecordCount(operator);
  }, [loadAuditEvents, loadPersonalRecordCount, supabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");

    if (!authError) {
      return;
    }

    const callbackMessage = formatAuthCallbackMessage(authError, params.get("auth_error_description"));
    params.delete("auth_error");
    params.delete("auth_error_description");

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);

    const messageTimer = window.setTimeout(() => {
      setAuthMessage(callbackMessage);
    }, 0);

    return () => {
      window.clearTimeout(messageTimer);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      return;
    }

    const supabaseClient = supabase;
    const authCode = code;

    params.delete("code");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);

    const exchangeTimer = window.setTimeout(() => {
      async function completeRootMagicLink() {
        setIsAuthBusy(true);
        setAuthMessage("Completing magic link sign-in...");

        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(authCode);

        setIsAuthBusy(false);

        if (error) {
          setAuthMessage(formatAuthCallbackMessage("callback_exchange_failed", error.message));
          return;
        }

        const nextUser = data.user ?? null;

        setUser(nextUser);
        setAuthMessage("Signed in.");
        await loadWorkspaceData(nextUser);
        router.refresh();
      }

      void completeRootMagicLink();
    }, 0);

    return () => {
      window.clearTimeout(exchangeTimer);
    };
  }, [loadWorkspaceData, router, supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsAuthLoaded(true);
      void loadWorkspaceData(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setIsAuthLoaded(true);
      setUser(nextUser);
      void loadWorkspaceData(nextUser);
      router.refresh();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadWorkspaceData, router, supabase]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("Supabase environment variables are not available in this deployment.");
      return;
    }

    if (!email.trim()) {
      setAuthMessage("Enter an email address first.");
      return;
    }

    setIsAuthBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setIsAuthBusy(false);

    if (error) {
      setAuthMessage(formatAuthError(error.message));
      return;
    }

    setAuthMessage("Magic link sent. Open the email and click the link; this card will show Signed in after you return.");
  }

  async function handlePasswordSignIn() {
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("Supabase environment variables are not available in this deployment.");
      return;
    }

    if (!email.trim() || !password) {
      setAuthMessage("Password sign-in only works for an existing Supabase Auth user with a password. Enter both fields first.");
      return;
    }

    setIsAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsAuthBusy(false);

    if (error) {
      setAuthMessage(formatAuthError(error.message));
      return;
    }

    setPassword("");
    setAuthMessage("Signed in.");
    router.refresh();
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setIsAuthBusy(true);
    await supabase.auth.signOut();
    setIsAuthBusy(false);
    setAuthMessage("Signed out.");
  }

  async function handleCreateWorkspace() {
    setWorkspaceMessage(null);

    if (!supabase || !user) {
      setWorkspaceMessage("Sign in before creating a workspace.");
      return;
    }

    setIsWorkspaceBusy(true);
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: "AI Venture Lab",
        slug: `ai-venture-lab-${user.id.slice(0, 8)}`,
      })
      .select()
      .single();
    setIsWorkspaceBusy(false);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setActiveOrganizationId(data.id);
    setWorkspaceMessage("Workspace created.");
    await loadWorkspaceData(user, data.id);
  }

  async function handleAttachPersonalRecords() {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("Create or select a workspace first.");
      return;
    }

    setIsWorkspaceBusy(true);
    const results = await Promise.all(
      workspaceRecordTables.map((table) =>
        supabase
          .from(table)
          .update({ organization_id: activeOrganization.id })
          .eq("created_by", user.id)
          .is("organization_id", null),
      ),
    );
    setIsWorkspaceBusy(false);

    const error = results.find((result) => result.error)?.error;

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage(`Attached ${personalRecordCount} personal record(s) to ${activeOrganization.name}.`);
    await loadWorkspaceData(user, activeOrganization.id);
    router.refresh();
  }

  async function handleSelectWorkspace(organizationId: string) {
    setActiveOrganizationId(organizationId);
    await loadAuditEvents(organizationId);
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("Select a workspace first.");
      return;
    }

    if (!canManageMembers) {
      setWorkspaceMessage("Only workspace owners and admins can add members.");
      return;
    }

    if (!memberEmail.trim()) {
      setWorkspaceMessage("Member email is required.");
      return;
    }

    setIsMemberBusy(true);
    const { error } = await supabase.rpc("add_organization_member_by_email", {
      target_organization_id: activeOrganization.id,
      target_email: memberEmail.trim(),
      target_role: memberRole,
    });
    setIsMemberBusy(false);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setMemberEmail("");
    setWorkspaceMessage("Workspace member added.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleUpdateMemberRole(member: OrganizationMember, role: AddableOrganizationRole) {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("Select a workspace first.");
      return;
    }

    setMemberActionKey(`${member.user_id}:role:${role}`);
    const { error } = await supabase.rpc("update_organization_member_role", {
      target_organization_id: activeOrganization.id,
      target_user_id: member.user_id,
      target_role: role,
    });
    setMemberActionKey(null);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage("Member role updated.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleRemoveMember(member: OrganizationMember) {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("Select a workspace first.");
      return;
    }

    setMemberActionKey(`${member.user_id}:remove`);
    const { error } = await supabase.rpc("remove_organization_member", {
      target_organization_id: activeOrganization.id,
      target_user_id: member.user_id,
    });
    setMemberActionKey(null);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage("Member removed.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleCreateIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);

    if (!supabase) {
      setSaveMessage("Supabase is not configured.");
      return;
    }

    if (!user) {
      setSaveMessage("Sign in before creating an idea.");
      return;
    }

    if (!form.name.trim() || !form.one_liner.trim()) {
      setSaveMessage("Name and one-liner are required.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("ideas").insert({
      name: form.name.trim(),
      one_liner: form.one_liner.trim(),
      target_user: form.target_user.trim(),
      buyer: form.buyer.trim(),
      signal: form.signal.trim(),
      risk_summary: form.risk_summary.trim(),
      next_evidence: form.next_evidence.trim(),
      stage: "intake",
      decision: "pending",
      problem_intensity: 0,
      frequency: 0,
      reachability: 0,
      willingness_to_pay: 0,
      mvp_speed: 0,
      differentiation: 0,
      regulatory_risk: 0,
      organization_id: activeOrganization?.id ?? null,
    });
    setIsSaving(false);

    if (error) {
      setSaveMessage(error.message);
      return;
    }

    setForm(emptyForm);
    setSaveMessage(
      activeOrganization
        ? `Idea saved to ${activeOrganization.name}. Refreshing portfolio.`
        : "Idea saved as a personal record. Create a workspace to attach future records.",
    );
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="grid gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Operator access</h2>
            <p className="mt-1 text-sm text-slate-500">
              Magic link uses email verification. Password sign-in is only for existing Supabase Auth users.
            </p>
          </div>
          <ShieldCheck className={user ? "text-emerald-600" : "text-slate-500"} size={24} />
        </div>

        {!isAuthLoaded ? (
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">Checking current session...</div>
        ) : user ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-900">Signed in</div>
              <div className="mt-1 break-all text-sm text-emerald-800">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isAuthBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="grid gap-3">
            <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              Use magic link for a new email session. Use password only after creating a password-based user in Supabase Auth.
            </div>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Password for existing account
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Existing Supabase Auth password only"
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <button
              type="button"
              onClick={handlePasswordSignIn}
              disabled={isAuthBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthBusy ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
              Sign in with existing password
            </button>
            <button
              type="submit"
              disabled={isAuthBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthBusy ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
              Send magic link
            </button>
          </form>
        )}

        {authMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{authMessage}</p> : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Workspace status</h2>
              <p className="mt-1 text-sm text-slate-500">Records can now be attached to an organization boundary.</p>
            </div>
            <Building2 className={activeOrganization ? "text-blue-600" : "text-slate-500"} size={24} />
          </div>

          {!user ? (
            <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Sign in to load workspace membership.
            </div>
          ) : activeOrganization ? (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Active workspace
                <select
                  value={activeOrganization.id}
                  onChange={(event) => {
                    void handleSelectWorkspace(event.target.value);
                  }}
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Role</div>
                  <div className="mt-2 text-lg font-semibold capitalize text-blue-950">
                    {activeMembership?.role ?? "member"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <Users size={14} />
                    Members
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{activeMemberCount}</div>
                </div>
              </div>
              {personalRecordCount > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-950">
                    {personalRecordCount} personal record(s) are outside this workspace.
                  </div>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    Attach them when you want the portfolio, risks, decisions, experiments, runs, and artifacts to share
                    the same workspace boundary.
                  </p>
                  <button
                    type="button"
                    onClick={handleAttachPersonalRecords}
                    disabled={isWorkspaceBusy}
                    className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-900 px-4 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isWorkspaceBusy ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
                    Attach personal records
                  </button>
                </div>
              ) : null}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Users size={16} />
                  Members
                </div>
                <div className="grid gap-2">
                  {activeMembers.map((member) => (
                    <div key={`${member.organization_id}-${member.user_id}`} className="rounded-md bg-slate-50 p-3">
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="break-all text-sm font-semibold text-slate-950">
                            {member.email || member.user_id}
                          </div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {member.role}
                            {member.user_id === user.id ? " / you" : ""}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {memberRoles.map((role) => {
                            const actionKey = `${member.user_id}:role:${role}`;
                            const isLastOwner = member.role === "owner" && ownerCount <= 1;

                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  void handleUpdateMemberRole(member, role);
                                }}
                                disabled={
                                  !canManageMembers ||
                                  member.role === role ||
                                  isLastOwner ||
                                  memberActionKey === actionKey
                                }
                                className="inline-flex h-8 items-center justify-center rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                {memberActionKey === actionKey ? "..." : role}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              void handleRemoveMember(member);
                            }}
                            disabled={
                              !canManageMembers ||
                              (member.role === "owner" && ownerCount <= 1) ||
                              memberActionKey === `${member.user_id}:remove`
                            }
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <Trash2 size={13} />
                            {memberActionKey === `${member.user_id}:remove` ? "..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={handleAddMember} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-950">Add existing Auth user</div>
                <div className="grid gap-3 sm:grid-cols-[1fr_132px]">
                  <input
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    type="email"
                    placeholder="member@example.com"
                    disabled={!canManageMembers}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <select
                    value={memberRole}
                    onChange={(event) => setMemberRole(event.target.value as AddableOrganizationRole)}
                    disabled={!canManageMembers}
                    className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {memberRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isMemberBusy || !canManageMembers}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMemberBusy ? <RefreshCw className="animate-spin" size={18} /> : <Users size={18} />}
                  Add member
                </button>
              </form>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Clock3 size={16} />
                  Recent audit
                </div>
                <div className="grid gap-2">
                  {auditEvents.length > 0 ? (
                    auditEvents.map((event) => (
                      <div key={event.id} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        <span className="font-semibold text-slate-950">{event.action}</span> {event.summary}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
                      No organization audit events yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                No workspace membership was found for this operator.
                {personalRecordCount > 0
                  ? ` ${personalRecordCount} personal record(s) can be attached after a workspace is created.`
                  : ""}
              </div>
              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={isWorkspaceBusy}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isWorkspaceBusy ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
                Create workspace
              </button>
            </div>
          )}

          {workspaceMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{workspaceMessage}</p> : null}
        </div>
      </div>

      <form onSubmit={handleCreateIdea} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">New idea intake</h2>
            <p className="mt-1 text-sm text-slate-500">
              {activeOrganization
                ? `Capture a raw idea inside ${activeOrganization.name}.`
                : "Capture a raw idea without jumping straight into build mode."}
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving || !user}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            Save idea
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <Field label="Buyer" value={form.buyer} onChange={(value) => setForm({ ...form, buyer: value })} />
          <Field
            label="One-liner"
            value={form.one_liner}
            onChange={(value) => setForm({ ...form, one_liner: value })}
            required
          />
          <Field
            label="Target user"
            value={form.target_user}
            onChange={(value) => setForm({ ...form, target_user: value })}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TextArea label="Signal" value={form.signal} onChange={(value) => setForm({ ...form, signal: value })} />
          <TextArea
            label="Risk summary"
            value={form.risk_summary}
            onChange={(value) => setForm({ ...form, risk_summary: value })}
          />
          <TextArea
            label="Next evidence"
            value={form.next_evidence}
            onChange={(value) => setForm({ ...form, next_evidence: value })}
          />
        </div>

        {saveMessage ? <p className="mt-4 text-sm leading-6 text-slate-600">{saveMessage}</p> : null}
      </form>
    </section>
  );
}

function formatAuthError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return "Supabase email rate limit exceeded. Wait for the email quota to reset, configure custom SMTP, or use password sign-in with a dashboard-created operator account.";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Invalid email or password. Create a confirmed user in Supabase Auth or check the password.";
  }

  return message;
}

function formatAuthCallbackMessage(error: string, description: string | null) {
  if (error === "missing_callback_state") {
    return "Magic link callback was missing its login code. Request a fresh link and open the newest email.";
  }

  if (error === "callback_exchange_failed") {
    const normalizedDescription = description?.toLowerCase() ?? "";

    if (normalizedDescription.includes("verifier")) {
      return "Magic link opened, but the original browser session was not found. Request the link again, then open it in the same browser profile where you clicked Send magic link.";
    }

    return description
      ? `Magic link callback failed: ${description}`
      : "Magic link callback failed. Request a fresh link and try again.";
  }

  return description ? `${error}: ${description}` : error;
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="min-h-28 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
