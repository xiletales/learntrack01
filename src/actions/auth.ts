"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const role = formData.get("role") as string;
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  let email: string;

  if (role === "student") {
    // Student logs in with NIS → email derived as nis_XXXXX@learntrack.local
    email = `nis_${identifier}@learntrack.local`;
  } else {
    // Teacher logs in with username → look up their actual email
    if (identifier.includes("@")) {
      // Fallback: allow email login too
      email = identifier;
    } else {
      // Look up email by username using admin client (bypasses RLS)
      const adminClient = createAdminClient();
      const { data: emailData, error: rpcError } = await adminClient
        .rpc("get_email_by_username", { p_username: identifier });

      if (rpcError || !emailData) {
        return { error: "Username not found. Please check your username and try again." };
      }
      email = emailData as string;
    }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Incorrect username or password." };
    }
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single();

  redirect(
    profile?.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}