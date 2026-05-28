import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(8, { message: "Min 8 characters" }).max(128),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, { message: "Tell us your name" }).max(80),
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z
    .string()
    .min(8, { message: "Min 8 characters" })
    .max(128)
    .regex(/[A-Z]/, { message: "Add an uppercase letter" })
    .regex(/[0-9]/, { message: "Add a number" }),
});

interface Field {
  name: "name" | "email" | "password";
  label: string;
  type: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
}

const baseFields: Record<string, Field> = {
  name: {
    name: "name",
    label: "Full name",
    type: "text",
    placeholder: "Aarav Sharma",
    icon: User,
    autoComplete: "name",
  },
  email: {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@marketiq.in",
    icon: Mail,
    autoComplete: "email",
  },
  password: {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    icon: Lock,
  },
};

interface Props {
  mode: "in" | "up";
  cta: string;
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

export function AuthForm({ mode, cta }: Props) {
  const navigate = useNavigate();
  const fields: Field[] =
    mode === "up"
      ? [
          baseFields.name,
          baseFields.email,
          { ...baseFields.password, autoComplete: "new-password" },
        ]
      : [baseFields.email, { ...baseFields.password, autoComplete: "current-password" }];

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resendTarget, setResendTarget] = useState<string | null>(null);

  const pwScore = strength(values.password ?? "");
  const pwLabel = ["Too weak", "Weak", "Decent", "Strong", "Excellent"][pwScore];

  const handleChange = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: "" }));
    setSubmitError("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = mode === "up" ? signUpSchema : signInSchema;
    const res = schema.safeParse(values);
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const k = String(issue.path[0] ?? "");
        if (k && !errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { emailRedirectTo: `${window.location.origin}/sign-in` },
        });

        if (error) throw error;

        if (data?.session) {
          // Email confirmation is disabled — session returned immediately
          setDone(true);
          setTimeout(() => navigate({ to: "/app/onboarding" }), 700);
        } else if (data?.user?.identities?.length === 0) {
          throw new Error("An account with this email already exists. Try signing in.");
        } else {
          // Email confirmation required but SMTP may not be configured
          setSubmitError(
            "Account created, but the confirmation email couldn't be sent. " +
              "Tell your Supabase admin to configure SMTP in Authentication → Settings, " +
              "or disable 'Confirm email' to skip verification for development.",
          );
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          const msg = error.message?.toLowerCase() || "";
          if (msg.includes("email not confirmed")) {
            setSubmitError("Email not yet confirmed. Check your inbox or click below to resend.");
            setResendTarget(values.email);
          } else if (msg.includes("invalid login credentials")) {
            setSubmitError(
              "Invalid email or password. If you signed up before disabling email confirmation, " +
                "that account is still unconfirmed. Try signing up again with a fresh account.",
            );
          } else {
            throw error;
          }
          setLoading(false);
          return;
        }

        setDone(true);
        setTimeout(() => navigate({ to: "/app" }), 700);
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <SocialButtons />
      <Divider />

      <div className="space-y-4">
        {fields.map((f, i) => {
          const Icon = f.icon;
          const isPw = f.name === "password";
          const err = errors[f.name];
          const value = values[f.name] ?? "";
          return (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i + 0.1, duration: 0.5 }}
              className="space-y-1.5"
            >
              <label className="text-xs font-medium text-muted-foreground tracking-wide flex items-center justify-between">
                <span>{f.label}</span>
                {isPw && mode === "in" && (
                  <button
                    type="button"
                    onClick={async () => {
                      const email = values.email;
                      if (!email) {
                        setSubmitError("Enter your email first to reset password.");
                        return;
                      }
                      setLoading(true);
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/sign-in`,
                        });
                        if (error) throw error;
                        setSubmitError("Password reset email sent — check your inbox.");
                      } catch (err) {
                        setSubmitError(err instanceof Error ? err.message : "Failed to send reset email");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="text-accent hover:underline text-xs disabled:opacity-50"
                  >
                    Forgot?
                  </button>
                )}
              </label>
              <div
                className={`relative group rounded-xl border bg-input/40 transition ${
                  focused === f.name
                    ? "border-primary/60 shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)]"
                    : err
                      ? "border-destructive/60"
                      : "border-border hover:border-border/80"
                }`}
              >
                <Icon
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition ${focused === f.name ? "text-primary" : "text-muted-foreground"}`}
                />
                <input
                  type={isPw && showPw ? "text" : f.type}
                  name={f.name}
                  value={value}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  onFocus={() => setFocused(f.name)}
                  onBlur={() => setFocused(null)}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  className="w-full bg-transparent pl-10 pr-11 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
                />
                {isPw && (
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-destructive font-medium"
                  >
                    {err}
                  </motion.div>
                )}
              </AnimatePresence>

              {isPw && mode === "up" && value && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-1 space-y-1"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((j) => (
                      <div key={j} className="h-1 flex-1 rounded-full bg-border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: pwScore > j ? "100%" : "0%" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              pwScore <= 1
                                ? "var(--bear)"
                                : pwScore === 2
                                  ? "var(--gold)"
                                  : "var(--bull)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                    {pwLabel}
                  </div>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive font-medium"
                >
                  {submitError}
                </motion.div>
              )}
              {resendTarget && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={async () => {
                    const { error } = await supabase.auth.resend({
                      type: "signup",
                      email: resendTarget,
                      options: { emailRedirectTo: `${window.location.origin}/sign-in` },
                    });
                    if (error) {
                      setSubmitError(`Resend failed: ${error.message}`);
                    } else {
                      setSubmitError("Confirmation email resent — check your inbox.");
                    }
                  }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Resend confirmation email
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {mode === "up" && (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer"
        >
          <input type="checkbox" required className="mt-0.5 accent-[var(--primary)]" />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="text-foreground hover:text-accent transition story-link underline">Terms</Link> and{" "}
            <Link to="/privacy" className="text-foreground hover:text-accent transition story-link underline">
              Privacy Policy
            </Link>
            .
          </span>
        </motion.label>
      )}

      <motion.button
        type="submit"
        disabled={loading || done}
        whileHover={{ scale: loading || done ? 1 : 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group w-full bg-gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl inline-flex items-center justify-center gap-2 shadow-glow disabled:opacity-80 transition relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.span
              key="d"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> You're in
            </motion.span>
          ) : loading ? (
            <motion.span
              key="l"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Securing session…
            </motion.span>
          ) : (
            <motion.span
              key="c"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2"
            >
              {cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </form>
  );
}

function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SocialBtn label="Google" />
      <SocialBtn label="Apple" />
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="glass rounded-xl py-2.5 text-sm font-medium hover:bg-card/60 transition inline-flex items-center justify-center gap-2"
    >
      {label === "Google" ? <GoogleIcon /> : <AppleIcon />}
      {label}
    </motion.button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
      <div className="h-px flex-1 bg-border" />
      or with email
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.5l2.63-2.55C16.84 3.3 14.66 2.4 12 2.4 6.93 2.4 2.8 6.5 2.8 11.6S6.93 20.8 12 20.8c6.93 0 9.2-4.86 9.2-7.4 0-.5-.05-.88-.13-1.2H12z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M16.365 1.43c0 1.14-.42 2.23-1.18 3.05-.83.91-2.21 1.62-3.36 1.5-.14-1.13.42-2.31 1.16-3.07.83-.86 2.27-1.51 3.38-1.48zM20.5 17.27c-.5 1.14-.74 1.65-1.39 2.66-.9 1.41-2.18 3.18-3.77 3.19-1.41.01-1.78-.93-3.7-.92-1.92.01-2.32.94-3.74.92-1.59-.01-2.8-1.6-3.7-3.01C2.5 16.92 2.18 12.4 4 9.97c1.27-1.7 3.27-2.69 5.16-2.69 1.92 0 3.13 1.07 4.71 1.07 1.54 0 2.48-1.07 4.71-1.07 1.71 0 3.5.93 4.78 2.55-4.2 2.31-3.51 8.36-2.86 7.44z" />
    </svg>
  );
}
