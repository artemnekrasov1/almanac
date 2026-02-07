import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getOrCreateSessionId } from "@/lib/session";
import type { ClickoutProduct, ClickEvent } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Step 1: Normalize and validate product ID
  const normalizedId = id.trim();

  if (!normalizedId || normalizedId.length > 100) {
    return new NextResponse("Invalid product ID format", { status: 400 });
  }

  // Step 2: Fetch product
  const supabase = supabaseServer();
  const { data: product, error } = await supabase
    .from("products")
    .select("id,affiliate_url,product_url,merchant_id")
    .eq("id", normalizedId)
    .maybeSingle<ClickoutProduct>();

  if (error) {
    console.error("Database error fetching product:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }

  if (!product) {
    return new NextResponse("Product not found", { status: 404 });
  }

  // Step 3: Determine redirect URL
  const redirectUrl = product.affiliate_url || product.product_url;

  if (!redirectUrl) {
    return new NextResponse("Product URL not available", { status: 404 });
  }

  // Validate URL scheme
  if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
    return new NextResponse("Invalid product URL", { status: 404 });
  }

  // Step 4: Extract request metadata
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  // Step 5: Get or create session ID
  const [sessionId, sessionCookie] = getOrCreateSessionId(request);

  // Step 6: Track click event
  const clickEvent: ClickEvent = {
    product_id: normalizedId,
    merchant_id: product.merchant_id,
    referrer: referrer,
    user_agent: userAgent,
    session_id: sessionId,
  };

  const { error: insertError } = await supabase
    .from("click_events")
    .insert(clickEvent);

  if (insertError) {
    console.error("Failed to track click event:", insertError);
  }

  // Step 7: Return redirect
  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  if (sessionCookie) {
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      {
        httpOnly: sessionCookie.httpOnly,
        secure: sessionCookie.secure,
        sameSite: sessionCookie.sameSite,
        maxAge: sessionCookie.maxAge,
        path: sessionCookie.path,
      }
    );
  }

  return response;
}
