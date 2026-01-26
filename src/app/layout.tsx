import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import Analytics from "@/components/Analytics";
import DonationButton from "@/components/DonationButton";
import Header from "@/components/Header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ROK Player Rankings - Rise of Kingdoms Leaderboard",
  description: "Track the most powerful Rise of Kingdoms players in KD. View detailed rankings by power, kill points, and alliance statistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body className={inter.className}>
        <Providers>

        <TooltipProvider>
          <Analytics />
          <DonationButton />
          <Header />
          {children}
        </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}