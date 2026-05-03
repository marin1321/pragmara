import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Pragmara — RAG-as-a-Service for Technical Documentation",
    template: "%s | Pragmara",
  },
  description:
    "Upload your docs, get a query API. Streaming answers with citations, evaluation scores, and cost tracking.",
  metadataBase: new URL("https://pragmara.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pragmara.vercel.app",
    siteName: "Pragmara",
    title: "Pragmara — RAG-as-a-Service for Technical Documentation",
    description:
      "Upload documentation. Get a query API. Streaming answers with citations and evaluation scores.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Pragmara" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pragmara — RAG-as-a-Service for Technical Documentation",
    description:
      "Upload documentation. Get a query API. Streaming answers with citations and evaluation scores.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" },
          }}
        />
      </body>
    </html>
  );
}
