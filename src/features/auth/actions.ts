"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNextPath(formData.get("next"));
  if (!email) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}&error=E-Mail%20fehlt`);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`);
  redirect(`/auth/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

export async function verifyOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\D/g, "");
  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) redirect(`/auth/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent(error?.message ?? "Code ungültig")}`);
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  redirect(profile ? next : `/profile/complete?next=${encodeURIComponent(next)}`);
}

export async function saveProfile(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim() || null;
  const next = safeNextPath(formData.get("next"), "/profile");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  const { error } = await supabase.from("profiles").upsert({ id: data.user.id, first_name: firstName, last_name: lastName, username, display_name: displayName });
  if (error) redirect(`/profile/complete?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`);
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
