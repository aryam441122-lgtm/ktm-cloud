import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashIcon, XIcon } from "@primer/octicons-react";

import "./auth-window.scss";

const electron = globalThis.electron as Electron;

type Mode = "sign-in" | "sign-up";

export default function AuthWindow() {
  const { t } = useTranslation("header");

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "sign-up") {
        await window.electron.signUpWithEmail({
          email,
          password,
          username,
          displayName: displayName || username,
        });
      } else {
        await window.electron.signInWithEmail({ email, password });
      }

      electron.closeAuthWindow();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-window">
      <header className="auth-window__title-bar">
        <h4>KTM</h4>
        <div className="auth-window__window-controls">
          <button
            type="button"
            className="auth-window__window-control"
            onClick={() => electron.minimizeAuthWindow()}
            title={t("minimize")}
            aria-label={t("minimize")}
          >
            <DashIcon size={16} />
          </button>
          <button
            type="button"
            className="auth-window__window-control auth-window__window-control--close"
            onClick={() => electron.closeAuthWindow()}
            title={t("close")}
            aria-label={t("close")}
          >
            <XIcon size={16} />
          </button>
        </div>
      </header>

      <form className="auth-window__form" onSubmit={handleSubmit}>
        <h2 className="auth-window__heading">
          {mode === "sign-in" ? "تسجيل الدخول إلى KTM" : "إنشاء حساب KTM"}
        </h2>

        {mode === "sign-up" && (
          <>
            <label className="auth-window__label">
              اسم المستخدم
              <input
                className="auth-window__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="auth-window__label">
              الاسم الظاهر
              <input
                className="auth-window__input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </label>
          </>
        )}

        <label className="auth-window__label">
          البريد الإلكتروني
          <input
            className="auth-window__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-window__label">
          كلمة المرور
          <input
            className="auth-window__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            minLength={6}
            required
          />
        </label>

        {error && <p className="auth-window__error">{error}</p>}

        <button
          type="submit"
          className="auth-window__submit"
          disabled={isLoading}
        >
          {isLoading
            ? "..."
            : mode === "sign-in"
              ? "تسجيل الدخول"
              : "إنشاء الحساب"}
        </button>

        <button
          type="button"
          className="auth-window__switch"
          onClick={() => {
            setError(null);
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          }}
        >
          {mode === "sign-in"
            ? "ما عندك حساب؟ أنشئ حساب جديد"
            : "عندك حساب؟ سجّل الدخول"}
        </button>
      </form>
    </div>
  );
}
