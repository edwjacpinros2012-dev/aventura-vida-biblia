import { appIconResponse } from "@/lib/pwa/app-icon";

export const runtime = "edge";

export function GET() {
  return appIconResponse(192);
}
