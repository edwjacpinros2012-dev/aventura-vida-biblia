import { cookies } from "next/headers";
import { accountFromSessionToken, sessionCookie } from "./service";

export async function currentAccount() {
  const cookieStore = await cookies();
  return accountFromSessionToken(cookieStore.get(sessionCookie.name)?.value);
}

export async function accountFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${sessionCookie.name}=([^;]+)`));
  return accountFromSessionToken(match?.[1]);
}
