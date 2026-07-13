// "use client";

// import { useRef, useState } from "react";
// import Link from "next/link";
// import { useClickOutside } from "@/lib/hooks/use-click-outside";

// type NavDropdownProps = {
//   label: string;
//   items: readonly string[];
//   paramName: "service" | "specialization";
// };

// export function NavDropdown({ label, items, paramName }: NavDropdownProps) {
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
//         {label}
//         <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
//           ▾
//         </span>
//       </button>

//       {open && (
//         <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-[14px] border border-sand-dark bg-white py-1 shadow-lg">
//           {items.map((item) => (
//             <Link
//               key={item}
//               href={`/catalog?${paramName}=${encodeURIComponent(item)}`}
//               onClick={() => setOpen(false)}
//               className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-sage-light"
//             >
//               {item}
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

type NavDropdownProps = {
  label: string;
  items: readonly string[];
  paramName: "service" | "specialization";
  columns?: 1 | 2;
};

export function NavDropdown({ label, items, paramName, columns = 1 }: NavDropdownProps) {
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
        {label}
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full mt-2 overflow-hidden rounded-[14px] bg-[#859d90] py-[5px] shadow-lg ${
            columns === 2 ? "w-[520px]" : "w-64"
          }`}
        >
          <div className={columns === 2 ? "grid grid-cols-2" : ""}>
            {items.map((item) => (
              <Link
                key={item}
                href={`/catalog?${paramName}=${encodeURIComponent(item)}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm text-white transition-colors hover:bg-white/10"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}