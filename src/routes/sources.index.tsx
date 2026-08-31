import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/sources/")({
  head: () => ({
    meta: [
      { title: "مصادر تحميل KTM — روابط JSON جاهزة" },
      {
        name: "description",
        content:
          "روابط مصادر التحميل الجاهزة لمشغل KTM: SteamRip وOnlineFix وFitGirl وGOG، انسخ الرابط وأضفه من الإعدادات.",
      },
      { property: "og:title", content: "مصادر تحميل KTM — روابط JSON جاهزة" },
      {
        property: "og:description",
        content: "انسخ رابط أي مصدر وأضفه داخل إعدادات KTM مباشرة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SourcesPage,
});

type Source = {
  name: string;
  file: string;
  tag: string;
  description: string;
};

const sources: Source[] = [
  {
    name: "SteamRip",
    file: "steamrip.json",
    tag: "PC / Pre-installed",
    description: "ألعاب جاهزة للتشغيل مباشرة بدون تثبيت معقّد.",
  },
  {
    name: "OnlineFix",
    file: "onlinefix.json",
    tag: "Multiplayer",
    description: "إصدارات تدعم اللعب الجماعي عبر الإنترنت.",
  },
  {
    name: "FitGirl",
    file: "fitgirl.json",
    tag: "Repacks",
    description: "أرشيف ضخم من الريباكات المضغوطة بحجم أصغر.",
  },
  {
    name: "GOG",
    file: "gog.json",
    tag: "DRM-Free",
    description: "إصدارات GOG الكلاسيكية والحديثة بدون حماية.",
  },
];

const BASE = "https://ktm-cloud.lovable.app";

function useOrigin() {
  const [origin, setOrigin] = useState(BASE);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);
  return origin;
}

function SourceCard({ source, origin }: { source: Source; origin: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${origin}/sources/${source.file}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur transition-colors hover:border-primary/50">
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
          {source.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-card-foreground">
            {source.name}
          </h2>
          <p className="text-xs text-muted-foreground">{source.description}</p>
        </div>
        <span className="ms-auto rounded-full border border-border/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {source.tag}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code
          dir="ltr"
          className="min-w-0 flex-1 truncate rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left text-xs text-muted-foreground"
        >
          {url}
        </code>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {copied ? "تم النسخ ✓" : "نسخ الرابط"}
          </button>
          <a
            href={`/sources/${source.file}`}
            className="rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            فتح
          </a>
        </div>
      </div>
    </li>
  );
}

function SourcesPage() {
  const origin = useOrigin();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute -top-40 start-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-6 py-16" dir="rtl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          KTM Launcher
        </span>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          مصادر التحميل
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          انسخ أي رابط بالأسفل وأضفه داخل البرنامج من: الإعدادات ← مصادر التنزيل
          ← إضافة مصدر.
        </p>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            "افتح KTM ثم الإعدادات",
            "اختر مصادر التنزيل",
            "الصق الرابط واضغط إضافة",
          ].map((step, i) => (
            <li
              key={step}
              className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground"
            >
              <span className="me-2 font-bold text-primary">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>

        <ul className="mt-10 grid gap-4">
          {sources.map((source) => (
            <SourceCard key={source.file} source={source} origin={origin} />
          ))}
        </ul>

        <p className="mt-10 text-xs text-muted-foreground">
          المصادر تُحدَّث تلقائياً — استخدم زر «مزامنة المصادر» داخل البرنامج
          للحصول على أحدث الروابط.
        </p>
      </div>
    </main>
  );
}
