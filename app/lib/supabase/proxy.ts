
import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          // 1. Server tomonidagi request cookies
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          // 2. Yangilangan request bilan response
          response = NextResponse.next({
            request,
          });

          // 3. Browser uchun cookies
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );

          // 4. Token refresh response'i
          // umumiy cache'da saqlanmasligi kerak
          if (headers) {
            Object.entries(headers).forEach(
              ([key, value]) => {
                if (typeof value === "string") {
                  response.headers.set(key, value);
                }
              }
            );
          }
        },
      },
    }
  );

  // Tokenni tekshiradi va kerak bo'lsa
  // session yangilanishini ishga tushiradi.
  await supabase.auth.getClaims();

  return response;
}