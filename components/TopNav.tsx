'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const tabs = [
  { href: '/dashboard', label: 'Кабинет' },
  { href: '/rating',    label: 'Рейтинг' },
  { href: '/motivation',label: 'Мотивация' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <ul className="flex flex-wrap gap-3">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname?.startsWith(t.href + '/');
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={[
                  'inline-block rounded-lg px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white',
                ].join(' ')}
                prefetch={true}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
