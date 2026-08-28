'use client';

import { useState } from 'react';
import type { ReferenceGroup } from '../lib/content/motivation-reference';

export default function ReferenceAccordion({ group }: { group: ReferenceGroup }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{group.subtitle}</p>

      <div className="mt-4 space-y-2">
        {group.items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-slate-200">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              >
                <span className="font-medium text-slate-900">{item.title}</span>
                <span className="shrink-0 text-xs uppercase tracking-wide text-slate-400">
                  {isOpen ? 'скрыть' : 'показать'}
                </span>
              </button>

              {isOpen ? (
                <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-700">
                  {item.paragraphs?.map((text, i) => <p key={i}>{text}</p>)}

                  {item.bullets ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {item.bullets.map((text, i) => <li key={i}>{text}</li>)}
                    </ul>
                  ) : null}

                  {item.sections?.map((section) => (
                    <div key={section.heading}>
                      <p className="font-medium text-slate-900">{section.heading}</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {section.bullets.map((text, i) => <li key={i}>{text}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
