import type { Metadata } from "next";
import { ProfileDashboard } from "@/components/profile-dashboard";

export const metadata: Metadata = { title: "Perfil | Aventura Vida", description: "Tu progreso de juego en Aventura Vida." };

export default function ProfilePage() { return <ProfileDashboard />; }
