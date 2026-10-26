import Link from "next/link";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-nexus grid min-h-[70vh] items-center gap-10 py-10 lg:grid-cols-2">
      {/* brand / promo side */}
      <div className="relative hidden overflow-hidden rounded-3xl border border-border p-10 lg:flex lg:flex-col lg:justify-between lg:h-[560px]">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(75% 70% at 25% 18%, rgba(255,255,255,0.05), transparent 62%), var(--color-surface)",
          }}
        />
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-display text-xl font-black text-[#04121a]">
            N
          </span>
          <span className="font-display text-2xl font-black">NEXUS</span>
        </Link>
        <div>
          <h2 className="font-display text-3xl font-black leading-tight">
            Join the squad.
            <br />
            Build your battle station.
          </h2>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-muted">
            {[
              { icon: Sparkles, t: "Early access to drops & deals" },
              { icon: Truck, t: "Track every order in one place" },
              { icon: ShieldCheck, t: "Faster checkout & warranty support" },
            ].map((f) => (
              <li key={f.t} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-primary">
                  <f.icon size={16} />
                </span>
                {f.t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* form side */}
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl font-black">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
