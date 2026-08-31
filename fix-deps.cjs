/**
 * fix-deps.cjs
 * يفحص تبعيات KTM/package.json التي تشير إلى مستودعات git
 * ويستبدل المحذوف/غير المتاح منها بنسخة npm، أو يحذفه إن لم يوجد بديل.
 * يُستدعى تلقائيا من build-ktm.bat
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const pkgPath = path.join(__dirname, "KTM", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// بدائل npm معروفة للحزم التي كانت تُثبَّت من git
const NPM_FALLBACK = {
  "steam-shortcut-editor": "^3.1.2",
};

function isGitDep(value) {
  return /^(git\+|https?:\/\/(www\.)?(github|gitlab|bitbucket)\.com\/|github:)/i.test(String(value));
}

function repoReachable(url) {
  const clean = String(url).replace(/^git\+/, "").replace(/#.*$/, "");
  try {
    execFileSync("git", ["ls-remote", "--heads", clean], {
      stdio: "ignore",
      timeout: 30000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" },
    });
    return true;
  } catch {
    return false;
  }
}

function npmVersion(name) {
  if (NPM_FALLBACK[name]) return NPM_FALLBACK[name];
  try {
    const v = execFileSync("npm", ["view", name, "version"], {
      encoding: "utf8",
      timeout: 60000,
      shell: process.platform === "win32",
    }).trim();
    return v ? `^${v}` : null;
  } catch {
    return null;
  }
}

let changed = 0;
for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
  const deps = pkg[field];
  if (!deps) continue;
  for (const [name, value] of Object.entries(deps)) {
    if (!isGitDep(value)) continue;
    process.stdout.write(`فحص ${name} -> ${value} ... `);
    if (repoReachable(value)) {
      console.log("متاح، لا تغيير");
      continue;
    }
    const alt = npmVersion(name);
    if (alt) {
      deps[name] = alt;
      changed++;
      console.log(`محذوف/غير متاح -> تم الاستبدال بنسخة npm ${alt}`);
    } else {
      delete deps[name];
      changed++;
      console.log("محذوف ولا يوجد بديل على npm -> تمت إزالته");
    }
  }
}

if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`[OK] تم إصلاح ${changed} تبعية في package.json`);
} else {
  console.log("[OK] كل التبعيات سليمة");
}
