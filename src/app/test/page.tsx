"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BirthdayField } from "@/components/BirthdayField";
import { MonthField } from "@/components/MonthField";
import { useTestStore } from "@/store/useTestStore";
import { partnerPaletteStyle } from "@/lib/partnerColors";
import { Gender, PartnerInfo } from "@/lib/types";

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

function PartnerFields({
  label,
  accent,
  value,
  onChange,
}: {
  label: string;
  accent: "p1" | "p2";
  value: PartnerInfo;
  onChange: (data: Partial<PartnerInfo>) => void;
}) {
  const styles =
    accent === "p1"
      ? { chip: "bg-[var(--color-p1-soft)] text-[var(--color-p1)]" }
      : { chip: "bg-[var(--color-p2-soft)] text-[var(--color-p2)]" };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className={`pill ${styles.chip}`}>{label}</span>
      </div>
      <input
        type="text"
        placeholder="Name"
        autoComplete="off"
        value={value.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="field"
      />
      <BirthdayField
        accent={accent}
        align={accent === "p1" ? "left" : "right"}
        value={value.birthday}
        onChange={(birthday) => onChange({ birthday })}
      />
      <select
        value={value.gender}
        onChange={(e) => onChange({ gender: e.target.value as Gender })}
        className="field"
      >
        <option value="">Gender</option>
        {genderOptions.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TestPage() {
  const {
    partner1,
    partner2,
    relationshipStart,
    setPartner1,
    setPartner2,
    setRelationshipStart,
    reportId,
    resetTest,
  } = useTestStore();
  const router = useRouter();
  const cleared = useRef(false);

  /**
   * Starting over in a tab that already finished a test.
   *
   * Submitting drops the saved copy of the answers, but the live store still
   * holds them — names, answers, and the question the reader stopped on — so
   * coming back here from the report and pressing Start Analysis would drop
   * them straight onto question 15 of the test they just took. A report id in
   * memory is what marks that tab as finished.
   *
   * Arriving mid-quiz (browser Back from question 1) has no report id, so a
   * half-finished test is left exactly as it was.
   */
  useEffect(() => {
    if (cleared.current || !reportId) return;
    cleared.current = true;
    resetTest();
  }, [reportId, resetTest]);

  const partnersReady = [partner1, partner2].every(
    (p) => p.name.trim() && p.birthday && p.gender,
  );
  const isValid = partnersReady && Boolean(relationshipStart);

  const handleSubmit = () => {
    if (isValid) router.push("/questions");
  };

  return (
    <main
      className="flex-1 px-5 py-10"
      style={partnerPaletteStyle(partner1.gender, partner2.gender)}
    >
      <div className="mx-auto w-full max-w-lg space-y-6">
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-slate-500 transition-colors hover:text-slate-600"
        >
          ← Back
        </Link>

        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            Take the test{" "}
            <span className="italic text-accent-500">
              together
            </span>{" "}
            from one device
          </h1>
          <p className="text-slate-600">
            We compare your two sets of answers — that&rsquo;s where the
            analysis comes from.
          </p>
        </header>

        <section className="card space-y-5 p-6">
          <h2 className="text-center font-bold text-slate-600">Who&rsquo;s taking it?</h2>
          <div className="grid grid-cols-2 gap-4">
            <PartnerFields
              label="Partner 1"
              accent="p1"
              value={partner1}
              onChange={setPartner1}
            />
            <PartnerFields
              label="Partner 2"
              accent="p2"
              value={partner2}
              onChange={setPartner2}
            />
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <div className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-600">
              When did your relationship start?
            </span>
            <MonthField
              value={relationshipStart}
              onChange={setRelationshipStart}
              label="Select a month"
            />
            <span className="mt-1 block text-xs text-slate-400">
              Roughly is fine.
            </span>
          </div>

          {/*
            The email field is gone. It was collected, stored for 24 hours and
            used for nothing: no results are sent, and Paddle asks for its own
            address at checkout because that is where the receipt comes from.
            Bring it back the day there is a mailing to justify it.
          */}
        </section>

        <button onClick={handleSubmit} disabled={!isValid} className="btn-primary">
          Start Analysis ♥
        </button>

        <p className="text-center text-xs text-slate-400">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline hover:text-slate-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-slate-500">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
