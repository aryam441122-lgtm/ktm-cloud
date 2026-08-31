import { createFileRoute, redirect } from "@tanstack/react-router";
import ktmZip from "@/assets/KTM.zip.asset.json";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/sources", replace: true });
  },
  head: () => ({
    meta: [
      { title: "KTM Launcher Source — تحميل المجلد الكامل" },
      {
        name: "description",
        content:
          "حمّل مجلد KTM كاملاً بكل ملفاته كأرشيف مضغوط بضغطة زر واحدة، مع خطوات بناء مثبت الويندوز NSIS.",
      },
      { property: "og:title", content: "KTM Launcher Source — تحميل المجلد الكامل" },
      {
        property: "og:description",
        content: "أرشيف KTM كامل جاهز للتحميل، وخطوات بناء مثبت NSIS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const steps = [
  { cmd: "winget install Rustlang.Rustup", label: "ثبّت Rust (cargo) وأعد فتح موجه الأوامر" },
  { cmd: "winget install Python.Python.3.12", label: "ثبّت Python 3 لبناء خدمة الـ RPC" },
  {
    cmd: "yarn install --ignore-optional",
    label: "الحزمة steam-shortcut-editor محذوفة من GitHub — احذفها من package.json أو استبدلها بنسخة npm",
  },
  { cmd: "yarn build:native", label: "بناء إضافة Rust الأصلية" },
  { cmd: "yarn build:python-rpc", label: "بناء خدمة Python RPC" },
  { cmd: "npx electron-vite build", label: "بناء الواجهة والعملية الرئيسية" },
  { cmd: "npx electron-builder --win nsis", label: "إخراج مثبت NSIS داخل مجلد dist" },
];

function Index() {
  const sizeMb = (ktmZip.size / (1024 * 1024)).toFixed(1);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl" dir="rtl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          KTM Launcher
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
          مجلد KTM كامل، جاهز للتحميل
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          تم نسخ مجلد KTM بكل محتوياته إلى هذا المشروع، وهو متاح هنا كأرشيف مضغوط واحد.
        </p>

        <a
          href={ktmZip.url}
          download="KTM.zip"
          className="mt-8 inline-flex items-center gap-3 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          تحميل KTM.zip
          <span className="text-sm font-normal opacity-80">{sizeMb} MB</span>
        </a>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-foreground">كيف تبني مثبت NSIS</h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, i) => (
              <li key={step.cmd} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  <code className="text-sm font-medium text-card-foreground">{step.cmd}</code>
                </div>
                <p className="mt-2 pr-6 text-sm text-muted-foreground">{step.label}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
