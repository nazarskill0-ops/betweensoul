import { MailIcon } from "./icons";

export function SupportView() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Підтримка</h1>

      <div className="flex flex-col items-start gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light">
          <MailIcon className="h-5 w-5 text-sage" />
        </div>
        <p className="text-ink-muted">
          Є питання чи потрібна допомога? Напишіть нам, і ми відповімо якнайшвидше.
        </p>
        <a
          href="mailto:support@calmi.in.ua"
          className="text-lg font-medium text-sage transition-colors hover:text-sage/80"
        >
          support@calmi.in.ua
        </a>
      </div>
    </div>
  );
}
