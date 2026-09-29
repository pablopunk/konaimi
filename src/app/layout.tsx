import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Konaimi — model matchday",
  description: "Compare AI models like players, with real benchmark scores and task cost.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
