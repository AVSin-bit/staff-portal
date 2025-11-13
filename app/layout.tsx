// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Портал сотрудников",
  description: "Цирюльникъ — внутренний портал",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}
