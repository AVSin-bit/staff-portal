export const metadata = {
  title: "Портал сотрудников",
  description: "Staff portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

