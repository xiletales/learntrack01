"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const nip = formData.get("nip") as string;
  const password = formData.get("password") as string;
  const gender = formData.get("gender") as string;
  const school = formData.get("school") as string;
  const schoolYear = formData.get("school_year") as string;
  const email = formData.get("email") as string;
  const classHandled = formData.get("class_handled") as string;
  const phone = formData.get("phone") as string;

  if (!name || !password) return { error: "Name and password are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (!email) return { error: "Email is required." };
  if (!username) return { error: "Username is required." };
  if (!nip) return { error: "NIP is required." };

  // Validasi format username
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Username can only contain lowercase letters, numbers, and underscores." };
  }

  // Cek username sudah dipakai atau belum
  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) {
    return { error: "Username already taken. Please choose another." };
  }

  const { data, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { error: "This email is already registered. Please log in instead." };
    }
    return { error: authError.message };
  }

  if (!data.user) return { error: "Failed to create account." };

  const userId = data.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "teacher",
    name,
    username,
    gender: gender || null,
    school: school || null,
    school_year: schoolYear || null,
  });

  if (profileError) return { error: profileError.message };

  const { error: teacherError } = await supabase.from("teachers").insert({
    id: userId,
    nip,
    class_handled: classHandled || null,
    phone: phone || null,
    email: email || null,
  });

  if (teacherError) return { error: teacherError.message };

  redirect("/login?registered=true");
}