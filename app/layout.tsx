import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PlayerProgressProvider } from "@/components/player-progress-provider";
import { OfflineProvider } from "@/components/offline-provider";
import { OfflineIndicator } from "@/components/offline-indicator";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Aventura Vida | Proyecto Vida Kids",
  description: "Juega, descubre, aprende y vive aventuras con valores.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <OfflineProvider>
          <PlayerProgressProvider>
            <PwaRegister />
            <OfflineIndicator />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </PlayerProgressProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
