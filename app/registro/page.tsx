import type { Metadata } from "next";
import { AccountForm } from "@/components/account-form";

export const metadata: Metadata = { title: "Crear cuenta | Aventura Vida" };
export default function RegisterPage() { return <AccountForm mode="register" />; }
