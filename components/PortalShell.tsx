import type { ReactNode } from 'react';
import PortalNav from './PortalNav';
import { navFor, ROLE_TITLE } from '../lib/roles';
import type { CurrentEmployee } from '../lib/auth/employee';

type Props = {
  current: CurrentEmployee;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
};

/** Общая рамка всех внутренних страниц: шапка, заголовок, контейнер. */
export default function PortalShell({ current, title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PortalNav
        items={navFor(current.role)}
        fullName={current.employee.full_name}
        roleTitle={ROLE_TITLE[current.role]}
        salonName={current.salon?.name ?? null}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle ? <div className="mt-1 text-sm text-slate-500">{subtitle}</div> : null}
        </div>

        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
