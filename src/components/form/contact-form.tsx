import { useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";

const inputClasses =
  "mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-950 placeholder:text-neutral-400 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

const serviceId = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID as
  | string
  | undefined;
const templateId = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID as
  | string
  | undefined;
const publicKey = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY as
  | string
  | undefined;

type StatusVariant = "idle" | "sending" | "success" | "error";

type StatusState = {
  variant: StatusVariant;
  title?: string;
  message?: string;
};

function statusClasses(variant: StatusVariant) {
  const base =
    "rounded-2xl border px-5 py-4 text-sm font-semibold transition-colors";
  if (variant === "success")
    return `${base} border-green-200 bg-green-50 text-green-700`;
  if (variant === "error")
    return `${base} border-red-200 bg-red-50 text-red-700`;
  if (variant === "sending")
    return `${base} border-neutral-200 bg-neutral-50 text-neutral-700`;
  return `${base} hidden`;
}

/**
 * Turns your select values into consistent "$" formatting.
 * If empty, returns "No budget was set".
 */
function formatBudget(raw: string | null | undefined) {
  const v = (raw ?? "").trim();
  if (!v) return "No budget was set";

  // Normalize variants to consistent output
  if (v.toLowerCase().includes("under")) return "Under $10,000";
  if (v.includes("$10k-$25k") || v.includes("$10k - $25k"))
    return "$10,000–$25,000";
  if (v.includes("$25k-$50k") || v.includes("$25k - $50k"))
    return "$25,000–$50,000";
  if (v.includes("$50k+") || v.includes("$50k +")) return "$50,000+";

  // If you ever change the <option> values, fallback safely:
  return v;
}

function createPreview(message: string) {
  const clean = message.trim().replace(/\s+/g, " ");
  return clean.length > 140 ? clean.slice(0, 140) + "…" : clean;
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<StatusState>({ variant: "idle" });

  const canSend = Boolean(serviceId && templateId && publicKey);
  const isSending = status.variant === "sending";

  const sendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    if (!canSend) {
      setStatus({
        variant: "error",
        title: "Email not configured",
        message:
          "The email service keys are missing. Please try again later or contact us directly.",
      });
      return;
    }

    setStatus({
      variant: "sending",
      title: "Sending…",
      message: "Hang tight—your message is on its way.",
    });

    try {
      const fd = new FormData(formRef.current);
      const fullMessage = String(fd.get("message") ?? "").trim();

      const templateParams = {
        // IMPORTANT: match these keys to EmailJS template variables
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        company: String(fd.get("company") ?? "").trim() || "—",
        budget: formatBudget(String(fd.get("budget") ?? "")),
        message: fullMessage,
        message_preview: createPreview(fullMessage),
      };

      await emailjs.send(serviceId!, templateId!, templateParams, {
        publicKey: publicKey!,
      });

      formRef.current.reset();

      setStatus({
        variant: "success",
        title: "Message sent",
        message: "Thanks for reaching out. We’ll reply within 24–48 hours.",
      });
    } catch (err) {
      setStatus({
        variant: "error",
        title: "Message failed",
        message:
          "Something went wrong while sending your message. Please try again, or email us directly.",
      });
      console.error("EmailJS send failed:", err);
    }
  };

  return (
    <form
      ref={formRef}
      className="mt-12 space-y-8"
      onSubmit={sendEmail}
      noValidate>
      <fieldset disabled={isSending} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-950"
              htmlFor="name">
              <span>Name</span>
              <span aria-hidden="true" className="leading-none text-red-500">
                *
              </span>
            </label>
            <input
              autoComplete="name"
              className={inputClasses}
              id="name"
              name="name"
              placeholder="Your name"
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-950"
              htmlFor="email">
              <span>Email</span>
              <span aria-hidden="true" className="leading-none text-red-500">
                *
              </span>
            </label>
            <input
              autoComplete="email"
              className={inputClasses}
              id="email"
              name="email"
              placeholder="you@company.com"
              required
              type="email"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-950"
              htmlFor="company">
              Company (optional)
            </label>
            <input
              autoComplete="organization"
              className={inputClasses}
              id="company"
              name="company"
              placeholder="Company name"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-950"
              htmlFor="budget">
              Budget range (optional)
            </label>
            <select
              className={inputClasses}
              id="budget"
              name="budget"
              defaultValue="">
              <option value="">Select range</option>

              {/* Make values stable; label can be anything */}
              <option value="Under $10k">Under $10k</option>
              <option value="$10k-$25k">$10k-$25k</option>
              <option value="$25k-$50k">$25k-$50k</option>
              <option value="$50k+">$50k+</option>
            </select>
          </div>
        </div>

        <div>
          <label
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-950"
            htmlFor="message">
            <span>Message</span>
            <span aria-hidden="true" className="leading-none text-red-500">
              *
            </span>
          </label>
          <textarea
            className={inputClasses}
            id="message"
            name="message"
            placeholder="What are you building, and where are you currently blocked?"
            required
            rows={7}
          />
        </div>

        <button
          className="rounded-full bg-primary px-10 py-4 text-[13px] font-bold uppercase tracking-widest text-white cursor-pointer transition-all hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit">
          {isSending ? "Sending…" : "Send Message"}
        </button>

        {status.variant !== "idle" && (
          <div
            role={status.variant === "error" ? "alert" : "status"}
            aria-live="polite"
            className={statusClasses(status.variant)}>
            {status.title ? <div className="mb-1">{status.title}</div> : null}
            {status.message ? (
              <div className="font-medium">{status.message}</div>
            ) : null}
          </div>
        )}
      </fieldset>
    </form>
  );
}
