import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PlayerProgressProvider } from "@/components/player-progress-provider";

export const metadata: Metadata = {
  title: "Aventura Vida | Proyecto Vida Kids",
  description: "Juega, descubre, aprende y vive aventuras con valores.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <PlayerProgressProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </PlayerProgressProvider>
      </body>
    </html>
  );
}
