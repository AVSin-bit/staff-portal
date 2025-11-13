РїВ»С—'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const linkStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  textDecoration: 'none',
  border: '1px solid #e5e7eb',
  display: 'inline-block',
  fontSize: 14,
  lineHeight: '20px',
  background: '#ffffff'
};

const activeStyle: React.CSSProperties = {
  ...linkStyle,
  background: '#111827',
  color: '#ffffff',
  borderColor: '#111827'
};

const barStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: '1px solid #e5e7eb',
  position: 'sticky',
  top: 0,
  background: '#fff',
  zIndex: 50
};

export default function TopNav() {
  const pathname = usePathname();

  const Item = ({
    href,
    children
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link href={href} style={pathname.startsWith(href) ? activeStyle : linkStyle}>
      {children}
    </Link>
  );

  return (
    <nav style={barStyle} aria-label="Р В РІР‚СљР В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р В РЎвЂР В РЎвЂ“Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ">
      <Item href="/dashboard">Р В РЎв„ўР В Р’В°Р В Р’В±Р В РЎвЂР В Р вЂ¦Р В Р’ВµР РЋРІР‚С™</Item>
      <Item href="/rating">Р В Р’В Р В Р’ВµР В РІвЂћвЂ“Р РЋРІР‚С™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ“</Item>
      <Item href="/motivation">Р В РЎС™Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ</Item>
    </nav>
  );
}


