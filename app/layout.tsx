import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Providers } from "@/components/providers";
import { themeScript } from "@/components/theme/theme-script";

export const metadata: Metadata = {
  title: {
    default: "CELEVATE — Civil Engineering Licensure Exam Review",
    template: "%s · CELEVATE",
  },
  description:
    "Elevate Your Knowledge. Earn Your License. Lessons, practice problems, mock board exams and progress analytics for the Philippine Civil Engineering Licensure Examination.",
  applicationName: "CELEVATE",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-elev-3"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
