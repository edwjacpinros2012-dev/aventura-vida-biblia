import type { Metadata } from "next";
import { BibleExplorer } from "@/components/bible/bible-explorer";

export const metadata: Metadata = {
  title: "Explorador de la Biblia | Aventura Vida",
  description: "Explora relatos bíblicos, actividades de aprendizaje y un desafío de preguntas para niños y familias.",
};

export default function BiblePage() {
  return <BibleExplorer />;
}
