import type { Metadata } from "next";
import { AccountForm } from "@/components/account-form";

export const metadata: Metadata = { title: "Iniciar sesión | Aventura Vida" };
export default function LoginPage() { return <AccountForm mode="login" />; }
