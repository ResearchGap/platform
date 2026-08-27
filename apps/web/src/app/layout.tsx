import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ResearchGap",
    template: "%s | ResearchGap",
  },
  description: "Research learning, programs, webinars, and practical academic insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} min-h-svh antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
