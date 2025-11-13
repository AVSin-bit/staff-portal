п»ї'use client';

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
    <nav style={barStyle} aria-label="Р вЂњР В»Р В°Р Р†Р Р…Р В°РЎРЏ Р Р…Р В°Р Р†Р С‘Р С–Р В°РЎвЂ Р С‘РЎРЏ">
      <Item href="/dashboard">Р С™Р В°Р В±Р С‘Р Р…Р ВµРЎвЂљ</Item>
      <Item href="/rating">Р В Р ВµР в„–РЎвЂљР С‘Р Р…Р С–</Item>
      <Item href="/motivation">Р СљР С•РЎвЂљР С‘Р Р†Р В°РЎвЂ Р С‘РЎРЏ</Item>
    </nav>
  );
}


