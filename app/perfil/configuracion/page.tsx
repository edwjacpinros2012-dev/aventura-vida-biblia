import type { Metadata } from "next";
import { AccountSecuritySettings } from "@/components/account-security-settings";

export const metadata: Metadata = { title: "Seguridad de la cuenta | Aventura Vida" };

export default function AccountSettingsPage() {
  return <AccountSecuritySettings />;
}
