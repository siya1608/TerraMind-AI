import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TerraMind AI | AI-Powered Climate Intelligence",
  description: "Advanced multi-agent carbon analysis, forecasting, offset marketplace, smart city tracking, and sustainability coaching.",
  keywords: "climate intelligence, carbon footprint calculator, sustainability index, climate simulation, green energy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <AppProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-container focus:text-on-primary-container focus:rounded-lg"
          >
            Skip to main content
          </a>
          <main id="main-content" className="flex-grow flex flex-col">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
