import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PlayerProgressProvider } from "@/components/player-progress-provider";
import { OfflineProvider } from "@/components/offline-provider";
import { OfflineIndicator } from "@/components/offline-indicator";
import { PwaRegister } from "@/components/pwa-register";
import { publicSiteName, publicSiteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: { default: `${publicSiteName} | Proyecto Vida Kids`, template: `%s | ${publicSiteName}` },
  description: "Juegos, aventuras y valores bíblicos para descubrir, aprender y vivir en familia.",
  applicationName: publicSiteName,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "/",
    siteName: publicSiteName,
    title: `${publicSiteName} | Proyecto Vida Kids`,
    description: "Juegos, aventuras y valores bíblicos para descubrir, aprender y vivir en familia.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Aventura Vida Biblia · Proyecto Vida Kids" }],
  },
  twitter: { card: "summary_large_image", title: publicSiteName, description: "Juegos y aventuras bíblicas para toda la familia.", images: ["/opengraph-image"] },
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
