import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { PermissionProvider } from "@/lib/permissions/permission-context";
import { NuqsAdapter } from 'nuqs/adapters/next/app';


export const metadata: Metadata = {
  title: "SFX Pre-Douane",
  description: "Système de gestion des dossiers de transit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <NuqsAdapter>
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </NuqsAdapter>
        <Toaster richColors />
      </body>
    </html>
  );
}
