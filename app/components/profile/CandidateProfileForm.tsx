"use client";

import { useState, type FormEvent } from "react";

type ProfileData = {
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

type Field = {
  name: keyof ProfileData;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

const fields: Field[] = [
  { name: "fullName", label: "Full Name", required: true, placeholder: "Ali Karimov" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "ali@example.com" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+998 XX XXX XX XX" },
  { name: "age", label: "Age (optional)", type: "number", placeholder: "23" },
  { name: "city", label: "City", required: true, placeholder: "Tashkent" },
  { name: "desiredPosition", label: "Desired Position", required: true, placeholder: "Frontend Developer" },
  { name: "experienceYears", label: "Years of Experience", type: "number", required: true, placeholder: "2" },
  { name: "previousCompany", label: "Previous Company", placeholder: "TechSoft" },
  { name: "previousRole", label: "Previous Position", placeholder: "Junior Frontend Developer" },
  { name: "education", label: "Education", placeholder: "University or qualification" },
  { name: "skills", label: "Skills", required: true, placeholder: "React, TypeScript, Next.js" },
  { name: "portfolioUrl", label: "Portfolio URL", type: "url", placeholder: "https://example.com" },
  { name: "cvUrl", label: "CV URL", type: "url", placeholder: "https://example.com/cv" },
];

export default function CandidateProfileForm() {
  const [preview, setPreview] = useState<ProfileData | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const get = (name: string) => String(formData.get(name) ?? "").trim();

    const profile: ProfileData = {
      fullName: get("fullName"),
      email: get("email"),
      phone: get("phone"),
      age: get("age"),
      city: get("city"),
      desiredPosition: get("desiredPosition"),
      experienceYears: get("experienceYears"),
      previousCompany: get("previousCompany"),
      previousRole: get("previousRole"),
      education: get("education"),
      skills: get("skills"),
      portfolioUrl: get("portfolioUrl"),
      cvUrl: get("cvUrl"),
      about: get("about"),
    };

    setPreview(profile);
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_350px]">
      <form onSubmit={handleSubmit} className="rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_12px_40px_rgba(23,35,29,0.05)] sm:p-9">
        <div className="mb-8 flex items-start gap-4 border-b border-[#17231d]/10 pb-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e8ecdf] text-lg font-black text-[#315a42]">01</span>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Your professional profile</h2>
            <p className="mt-1 text-sm leading-6 text-[#68736b]">Fields marked required help us build your profile preview.</p>
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-bold text-[#334139]">
                {field.label}
                {field.required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                min={field.type === "number" ? 0 : undefined}
                max={field.name === "age" ? 120 : undefined}
                placeholder={field.placeholder}
                className="rounded-xl border border-[#17231d]/15 bg-[#f4f3ec]/60 px-4 py-3 text-sm text-[#17231d] outline-none transition placeholder:text-[#8b948b] focus:border-[#536c51] focus:bg-white focus:ring-4 focus:ring-[#536c51]/10"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="about" className="text-sm font-bold text-[#334139]">
            About Me
          </label>

          <textarea
            id="about"
            name="about"
            rows={5}
            placeholder="Tell us about your experience, projects and career goals..."
            className="resize-y rounded-xl border border-[#17231d]/15 bg-[#f4f3ec]/60 px-4 py-3 text-sm leading-6 text-[#17231d] outline-none transition placeholder:text-[#8b948b] focus:border-[#536c51] focus:bg-white focus:ring-4 focus:ring-[#536c51]/10"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#17231d]/10 pt-6">
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#c9f36a] px-6 py-3.5 font-bold text-[#17231d] transition hover:-translate-y-0.5 hover:bg-[#b9e653]">
            Preview profile <span aria-hidden="true">→</span>
          </button>
          <p className="text-xs leading-5 text-slate-400">Your information stays in this browser session.</p>
        </div>
      </form>

      <aside className="overflow-hidden rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] shadow-[0_12px_40px_rgba(23,35,29,0.05)] lg:sticky lg:top-28">
        <div className="bg-[#244a39] px-6 py-6 text-white">
          <p className="eyebrow text-[#c9f36a]">Live preview</p>
          <h2 className="mt-2 text-xl font-black">Your profile card</h2>
        </div>

        {!preview ? (
          <div className="p-6">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-400">✦</div>
            <p className="mt-5 font-bold text-slate-800">Your story starts here</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add your details and preview how your professional profile will look.
            </p>
            <div className="mt-6 space-y-3">
              <div className="h-3 w-3/4 rounded-full bg-slate-100" />
              <div className="h-3 w-1/2 rounded-full bg-slate-100" />
              <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#e8ecdf] text-xl font-black text-[#315a42]">
                {preview.fullName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-slate-900">{preview.fullName}</h3>
                <p className="mt-1 truncate font-semibold text-[#536c51]">{preview.desiredPosition}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-400">Location</p>
                <p className="mt-1 font-bold text-slate-800">{preview.city}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-400">Experience</p>
                <p className="mt-1 font-bold text-slate-800">{preview.experienceYears} years</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Previous work</p>
              <p className="mt-1 font-semibold text-slate-800">
                {preview.previousRole || "Not provided"}{preview.previousCompany && ` · ${preview.previousCompany}`}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {preview.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                  <span key={skill} className="rounded-full bg-[#e8ecdf] px-3 py-1.5 text-xs font-semibold text-[#315a42]">{skill}</span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Education</p>
              <p className="mt-1 font-semibold text-slate-800">{preview.education || "Not provided"}</p>
            </div>

            {preview.about && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">About</p>
                <p className="mt-1 whitespace-pre-wrap leading-6 text-slate-600">{preview.about}</p>
              </div>
            )}

            <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Demo only. Data is stored in React state and will disappear on refresh.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
