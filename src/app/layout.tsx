import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://swiito.in"),
  title: {
    default: "Swiito — Verified Properties in Ranchi",
    template: "%s | Swiito",
  },
  description:
    "Find verified flats, rooms, PGs, and houses for rent and sale in Ranchi. All enquiries go through Swiito's broker — your details stay private.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://swiito.in",
    siteName: "Swiito",
    title: "Swiito — Verified Properties in Ranchi",
    description:
      "Find verified flats, rooms, PGs, and houses for rent and sale in Ranchi.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Swiito — Verified Properties in Ranchi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiito — Verified Properties in Ranchi",
    description:
      "Find verified flats, rooms, PGs, and houses for rent and sale in Ranchi.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${inter.variable}`}
    >
      {/* Inline theme init before first paint to avoid flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('swiito-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
