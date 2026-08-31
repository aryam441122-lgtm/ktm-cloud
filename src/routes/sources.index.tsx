import { createFileRoute } from "@tanstack/react-router";

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

const sources = [
  { name: "SteamRip", file: "steamrip.json" },
  { name: "OnlineFix", file: "onlinefix.json" },
  { name: "FitGirl", file: "fitgirl.json" },
  { name: "GOG", file: "gog.json" },
];

function SourcesPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl" dir="rtl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          مصادر التحميل
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          انسخ أي رابط بالأسفل وأضفه من إعدادات KTM ← مصادر التنزيل ← إضافة مصدر.
        </p>

        <ul className="mt-10 space-y-4">
          {sources.map((source) => (
            <li
              key={source.file}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-base font-semibold text-card-foreground">
                {source.name}
              </p>
              <a
                href={`/sources/${source.file}`}
                className="mt-2 block break-all text-sm text-primary underline-offset-4 hover:underline"
              >
                https://ktm-cloud.lovable.app/sources/{source.file}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
