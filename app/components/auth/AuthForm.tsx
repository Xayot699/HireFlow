
"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  login,
  register,
} from "@/app/auth/actions";

import {
  initialAuthState,
} from "@/types/auth-state";
import { translate, type Locale } from "@/lib/messages";

type Props = {
  mode: "login" | "register";
  locale: Locale;
};

export default function AuthForm({
  mode,
  locale,
}: Props) {
  const isLogin = mode === "login";
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  const [state, action, pending] =
    useActionState(
      isLogin ? login : register,
      initialAuthState
    );

  return (
    <form
      action={action}
      className="site-card mx-auto w-full max-w-md rounded-4xl border border-[#17231d]/10 bg-[#fbfaf5] p-6 shadow-[0_20px_70px_rgba(23,35,29,0.09)] sm:p-9"
    >
      <div className="mb-8 border-b border-[#17231d]/10 pb-6">
        <p className="eyebrow text-[#536c51]">{t("accountEyebrow")}</p>

        <h1 className="display-serif mt-3 text-4xl leading-tight text-[#17231d]">
          {t(isLogin ? "loginTitle" : "registerTitle")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#68736b]">
          {t(isLogin ? "loginDescription" : "registerDescription")}
        </p>
      </div>

      {!isLogin && (
        <div className="mb-5">
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-bold text-[#334139]"
          >
            {t("fullName")}
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="Ali Karimov"
            className="w-full rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa198] focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10"
          />
        </div>
      )}

      <div className="mb-5">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-[#334139]"
        >
          {t("email")}
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa198] focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-bold text-[#334139]"
        >
          {t("password")}
        </label>

        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={
            isLogin
              ? "current-password"
              : "new-password"
          }
          placeholder={t("passwordHint")}
          className="w-full rounded-xl border border-[#17231d]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa198] focus:border-[#536c51] focus:ring-4 focus:ring-[#536c51]/10"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {state.error}
        </p>
      )}

      {state.message && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="site-cta w-full rounded-full bg-[#c9f36a] px-5 py-3.5 font-bold text-[#17231d] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#b9e653] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t("pleaseWait") : isLogin ? t("signIn") : t("createAccount")}
      </button>

      <p className="mt-6 text-center text-sm text-[#68736b]">
        {t(isLogin ? "noAccount" : "alreadyAccount")}
        {" "}

        <Link
          href={
            isLogin
              ? "/register"
              : "/login"
          }
          className="font-bold text-[#315a42] underline decoration-[#315a42]/30 underline-offset-4 hover:decoration-[#315a42]"
        >
          {isLogin ? t("register") : t("signIn")}
        </Link>
      </p>
    </form>
  );
}
