"use client";

import { useActionState } from "react";

import { saveCandidateProfile } from "@/features/profile/actions";
import {
  initialProfileActionState,
  type ProfileActionState,
} from "@/features/profile/action-state";
import { translate, type Locale } from "@/lib/messages";

export type CandidateProfileValues = {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  city: string;
  desiredPosition: string;
  experienceYears: string;
  previousCompany: string;
  previousRole: string;
  education: string;
  skills: string;
  portfolioUrl: string;
  cvUrl: string;
  about: string;
};

type Props = { initialProfile: CandidateProfileValues; locale: Locale };

type Field = {
  name: Exclude<keyof CandidateProfileValues, "email">;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
};

const fields: Field[] = [
  { name: "fullName", label: "Full name", required: true, placeholder: "Ali Karimov", maxLength: 120 },
  { name: "phone", label: "Phone number", type: "tel", placeholder: "+998 XX XXX XX XX", maxLength: 40 },
  { name: "age", label: "Age", type: "number", placeholder: "23" },
  { name: "city", label: "City", required: true, placeholder: "Tashkent", maxLength: 100 },
  { name: "desiredPosition", label: "Desired position", required: true, placeholder: "Frontend Developer", maxLength: 120 },
  { name: "experienceYears", label: "Years of experience", type: "number", required: true, placeholder: "2" },
  { name: "previousCompany", label: "Previous company", placeholder: "TechSoft", maxLength: 120 },
  { name: "previousRole", label: "Previous position", placeholder: "Junior Frontend Developer", maxLength: 120 },
  { name: "education", label: "Education", placeholder: "University or qualification", maxLength: 200 },
  { name: "skills", label: "Skills", required: true, placeholder: "React, TypeScript, Next.js", maxLength: 500 },
  { name: "portfolioUrl", label: "Portfolio URL", type: "url", placeholder: "https://example.com", maxLength: 500 },
  { name: "cvUrl", label: "CV URL", type: "url", placeholder: "https://example.com/cv", maxLength: 500 },
];

export default function CandidateProfileForm({ initialProfile, locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(
    saveCandidateProfile,
    initialProfileActionState,
  );

  return (
    <form action={action} className="site-card rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_12px_40px_rgba(23,35,29,0.05)] sm:p-9">
      <div className="mb-8 border-b border-[#17231d]/10 pb-6">
        <h2 className="text-2xl font-black tracking-tight">{t("professionalProfile")}</h2>
        <p className="mt-2 text-sm leading-6 text-[#68736b]">{t("profileSavedDetails")}</p>
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <label htmlFor="profile-email" className="text-sm font-bold text-[#334139]">{t("accountEmail")}</label>
        <input id="profile-email" type="email" value={initialProfile.email} readOnly className="rounded-xl border border-[#17231d]/10 bg-[#eeeee7] px-4 py-3 text-sm text-[#68736b]" />
        <p className="text-xs text-[#8b948b]">{t("emailFromAccount")}</p>
      </div>

      <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <label htmlFor={field.name} className="text-sm font-bold text-[#334139]">
              {t(({fullName:"fullName",phone:"phone",age:"age",city:"city",desiredPosition:"desiredPosition",experienceYears:"yearsExperience",previousCompany:"previousCompany",previousRole:"previousPosition",education:"education",skills:"skills",portfolioUrl:"portfolioUrl",cvUrl:"cvUrl",about:"aboutMe"})[field.name] as Parameters<typeof translate>[1])}{field.required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              min={field.type === "number" ? 0 : undefined}
              max={field.name === "age" ? 120 : field.name === "experienceYears" ? 60 : undefined}
              maxLength={field.maxLength}
              defaultValue={initialProfile[field.name]}
              placeholder={field.placeholder}
              className="rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm text-[#17231d] outline-none transition placeholder:text-[#8b948b] focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor="about" className="text-sm font-bold text-[#334139]">{t("aboutMe")}</label>
        <textarea
          id="about"
          name="about"
          rows={5}
          maxLength={2000}
          defaultValue={initialProfile.about}
          placeholder={t("aboutPlaceholder")}
          className="resize-y rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm leading-6 text-[#17231d] outline-none transition placeholder:text-[#8b948b] focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10"
        />
      </div>

      {state.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>}
      {state.message && <p role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{state.message}</p>}

      <div className="mt-8 border-t border-[#17231d]/10 pt-6">
        <button type="submit" disabled={pending} className="site-cta rounded-full bg-[#c9f36a] px-6 py-3.5 font-bold text-[#17231d] transition hover:bg-[#b9e653] disabled:cursor-wait disabled:opacity-60">
          {pending ? t("savingProfile") : t("saveProfile")}
        </button>
      </div>
    </form>
  );
}
