'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  fullName: string;
  roleTitle: string;
  salonName?: string | null;
};

/**
 * Единая шапка портала. Состав пунктов приходит с сервера (navFor),
 * поэтому мастер физически не видит ссылок на чужие разделы.
 */
export default function PortalNav({ items, fullName, roleTitle, salonName }: Props) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{fullName}</p>
          <p className="truncate text-sm text-slate-500">
            {roleTitle}
            {salonName ? ' • ' + salonName : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap gap-2">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'rounded-full px-4 py-2 text-sm font-medium transition ' +
                    (active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
