import type { Metadata } from "next";
import { ArmaduraCampaign } from "@/components/adventure-campaign/armadura-campaign";

export const metadata: Metadata = {
  title: "La Gran Aventura | Aventura Vida",
  description: "Acompaña a Elián en busca de la Armadura del Espíritu.",
};

export default function ArmaduraDelEspirituPage() {
  return <ArmaduraCampaign />;
}
