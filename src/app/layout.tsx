import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agora",
  description: "Digitale Beteiligung für reale Gemeinschaften",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
