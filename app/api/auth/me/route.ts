import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  return NextResponse.json({ account });
}
