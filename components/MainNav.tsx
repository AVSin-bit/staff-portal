п»ї// components/MainNav.tsx
import Link from "next/link";

export function MainNav() {
  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      <Link href="/dashboard" className="hover:underline">Р вЂќР В°РЎв‚¬Р В±Р С•РЎР‚Р Т‘</Link>
      <Link href="/rating" className="hover:underline">Р В Р ВµР в„–РЎвЂљР С‘Р Р…Р С–</Link>
      <Link href="/motivation" className="hover:underline">Р СљР С•РЎвЂљР С‘Р Р†Р В°РЎвЂ Р С‘РЎРЏ</Link>
      <Link href="/benefits" className="hover:underline">Р РЋР С”Р С‘Р Т‘Р С”Р С‘ Р С‘ Р В±Р С•Р Р…РЎС“РЎРѓРЎвЂ№</Link>
      <Link href="/spirit-calendar" className="hover:underline">Р С™Р В°Р В»Р ВµР Р…Р Т‘Р В°РЎР‚РЎРЉ Р Т‘РЎС“РЎвЂ¦Р В°</Link>
    </nav>
  );
}


