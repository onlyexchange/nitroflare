import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "NitroFlare",
  description: "Landing page demo deployed on Vercel"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
