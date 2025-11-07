import type { Metadata } from 'next';
import './globals.css';
import TopBar from '@/components/TopBar';

export const metadata: Metadata = {
  title: 'Портал сотрудников',
  description: 'Баллы, рейтинги, стаж и условия',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <TopBar />
        <main style={{ maxWidth: 1000, margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
