
import type {
  EmailOtpType,
} from "@supabase/supabase-js";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } =
    new URL(request.url);

  const tokenHash =
    searchParams.get("token_hash");

  const type =
    searchParams.get("type") as EmailOtpType | null;

  const successUrl = new URL(
    "/profile",
    request.url
  );

  const errorUrl = new URL(
    "/auth/error",
    request.url
  );

  // Faqat ushbu email confirmation
  // flow'ini qabul qilamiz
  if (!tokenHash || type !== "email") {
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

  if (error) {
    console.error(
      "EMAIL CONFIRM ERROR:",
      error.code
    );

    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(successUrl);
}