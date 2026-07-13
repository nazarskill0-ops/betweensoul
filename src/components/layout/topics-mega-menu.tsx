// "use client";

// import { useRef, useState } from "react";
// import Link from "next/link";
// import { useClickOutside } from "@/lib/hooks/use-click-outside";
// import { TOPIC_GROUPS } from "@/features/psychologists/schema";

// export function TopicsMegaMenu() {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useClickOutside(ref, () => setOpen(false));

//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className="flex items-center gap-1 text-sm text-ink transition-colors hover:text-sage"
//       >
//         Теми
//         <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
//           ▾
//         </span>
//       </button>

//       {open && (
//         <div className="absolute left-1/2 top-full mt-2 w-[720px] -translate-x-1/2 rounded-[14px] border border-sand-dark bg-white p-6 shadow-lg">
//           <div className="grid grid-cols-4 gap-6">
//             {TOPIC_GROUPS.map((group) => (
//               <div key={group.group}>
//                 <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
//                   {group.group}
//                 </div>
//                 <ul className="space-y-1.5">
//                   {group.topics.map((topic) => (
//                     <li key={topic}>
//                       <Link
//                         href={`/catalog?topic=${encodeURIComponent(topic)}`}
//                         onClick={() => setOpen(false)}
//                         className="text-sm text-ink transition-colors hover:text-sage"
//                       >
//                         {topic}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { TOPIC_GROUPS } from "@/features/psychologists/schema";

// Дополнительный блок "популярные запросы" — колонки и формулировки на своё усмотрение,
// не завязаны на TOPIC_GROUPS из схемы. Ссылки — лучшее приближение к существующим
// topic/service значениям из schema.ts, где это было возможно.
const FEATURED_QUERIES = [
  [
    { label: "Як подолати депресію", href: "/catalog?topic=Депресивні стани" },
    { label: "Про стрес та тривогу", href: "/catalog?topic=Панічні атаки" },
    { label: "Як підняти самооцінку", href: "/catalog?topic=Самооцінка та самоцінність" },
  ],
  [
    { label: "Про сенс життя та саморозвиток", href: "/catalog?topic=Емоційне вигорання" },
    { label: "Психологія стосунків", href: "/catalog?topic=Сімейні стосунки" },
    { label: "Сексуальна несумісність", href: "/catalog?service=Сексологія" },
  ],
];

export function TopicsMegaMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-ink transition-colors hover:text-sage"
      >
        Теми
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full mt-2 w-[760px] -translate-x-1/2 rounded-[14px] bg-[#859d90] p-[29px] shadow-lg">
          <div className="mb-[10px] text-lg font-medium text-white">Теми запитів</div>

          <div className="grid grid-cols-4 gap-[29px]">
            {TOPIC_GROUPS.map((group) => (
              <div key={group.group}>
                <div className="mb-[10px] text-xs font-medium uppercase tracking-wide text-white/70">
                  {group.group}
                </div>
                <ul className="space-y-[7px]">
                  {group.topics.map((topic) => (
                    <li key={topic}>
                      <Link
                        href={`/catalog?topic=${encodeURIComponent(topic)}`}
                        onClick={() => setOpen(false)}
                        className="text-sm text-white transition-colors hover:text-white/70"
                      >
                        {topic}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-[29px] border-t border-white/20 pt-[29px]">
            <div className="mb-[10px] text-xs font-medium uppercase tracking-wide text-white/70">
              Більше про популярні запити
            </div>
            <div className="grid grid-cols-2 gap-x-[29px] gap-y-[7px]">
              {FEATURED_QUERIES.flat().map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-white transition-colors hover:text-white/70"
                >
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}