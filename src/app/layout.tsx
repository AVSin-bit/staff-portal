import type { Metadata } from 'next';
import './globals.css';
import TopBar from '@/components/TopBar';

export const metadata: Metadata = {
  title: 'РџРѕСЂС‚Р°Р» СЃРѕС‚СЂСѓРґРЅРёРєРѕРІ',
  description: 'Р‘Р°Р»Р»С‹, СЂРµР№С‚РёРЅРіРё, СЃС‚Р°Р¶ Рё СѓСЃР»РѕРІРёСЏ',
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

