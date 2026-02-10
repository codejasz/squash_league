"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SKILL_LEVELS } from "@/lib/constants";
import type { SkillLevel } from "@prisma/client";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  skillLevel: SkillLevel;
};

async function updateProfile(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      skillLevel: formData.get("skillLevel"),
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    return { success: false, error: data.error || "Wystąpił błąd" };
  }
  window.location.href = "/profile";
  return { success: true };
}

export default function EditProfilePage() {
  const [state, formAction, pending] = useActionState(updateProfile, {
    success: false,
  });
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {});
  }, []);

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-500">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do profilu
      </Link>

      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-8">Edytuj profil</h1>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                Imię
              </label>
              <input
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                Nazwisko
              </label>
              <input
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={profile.email}
              disabled
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email nie może być zmieniony
            </p>
          </div>

          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium mb-1.5">
              Poziom umiejętności
            </label>
            <select
              id="skillLevel"
              name="skillLevel"
              defaultValue={profile.skillLevel}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
            >
              {(Object.entries(SKILL_LEVELS) as [SkillLevel, (typeof SKILL_LEVELS)[SkillLevel]][]).map(
                ([key, { label, description }]) => (
                  <option key={key} value={key}>
                    {label} — {description}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </form>
      </div>
    </div>
  );
}
