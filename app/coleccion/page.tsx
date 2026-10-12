import type { Metadata } from "next";
import { CollectionDashboard } from "@/components/collection-dashboard";

export const metadata: Metadata = { title: "Colección | Aventura Vida Biblia", description: "Tienda e inventario de Monedas de Aventura." };

export default function CollectionPage() { return <CollectionDashboard />; }
