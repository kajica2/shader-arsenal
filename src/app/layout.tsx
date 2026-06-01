import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHADER ARSENAL — Lygia Live",
  description:
    "A working arsenal of Lygia GLSL shaders. Audio-reactive demos, live playground, and a copy-paste library.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
