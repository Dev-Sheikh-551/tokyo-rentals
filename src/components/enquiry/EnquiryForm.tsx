"use client";

import { useRef, useState, useCallback, useId, useEffect } from "react";
import { vehicles } from "@/data/vehicles";
import {
  type EnquiryData,
  type EnquiryValidationErrors,
  type EnquiryStatus,
  validateEnquiry,
  hasErrors,
} from "@/types/enquiry";
import { submitEnquiry } from "@/lib/enquiry-service";

interface EnquiryFormProps {
  onSuccess: () => void;
  /** Pre-select a vehicle in the form when opened from a vehicle detail view. */
  initialVehicleId?: string | null;
}

const EMPTY_FORM: EnquiryData = {
  name: "",
  email: "",
  phone: "",
  vehicle: "",
  message: "",
};

/**
 * EnquiryForm — Editorial enquiry form.
 *
 * Styled as underline-field inputs rather than conventional
 * bordered boxes. Labels sit above the field, transition on
 * focus. Validation is per-field on blur, full on submit.
 *
 * Vehicle options are sourced from the central vehicles dataset.
 * Because all entries are isDemoAsset: true, the select label
 * reflects interest rather than availability.
 */
export default function EnquiryForm({ onSuccess, initialVehicleId }: EnquiryFormProps) {
  const uid = useId();
  const [data, setData] = useState<EnquiryData>(EMPTY_FORM);
  const [errors, setErrors] = useState<EnquiryValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<EnquiryStatus>("idle");
  const firstErrorRef = useRef<HTMLElement | null>(null);
  const formOpenedAt = useRef<number>(0);

  // Record when the form becomes visible on the client
  useEffect(() => {
    formOpenedAt.current = Date.now();
  }, []);

  // Pre-select vehicle when opened from a vehicle detail view
  useEffect(() => {
    if (initialVehicleId) {
      setData((prev) => ({ ...prev, vehicle: initialVehicleId }));
    } else {
      setData((prev) => ({ ...prev, vehicle: "" }));
    }
  }, [initialVehicleId]);

  const handleChange = useCallback(
    (field: keyof EnquiryData, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
      // Clear error for the field being edited
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof EnquiryData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateEnquiry(data);
      setErrors((prev) => ({
        ...prev,
        ...(fieldErrors[field] ? { [field]: fieldErrors[field] } : {}),
      }));
    },
    [data]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const fieldErrors = validateEnquiry(data);
      if (hasErrors(fieldErrors)) {
        setErrors(fieldErrors);
        setTouched({ name: true, email: true, message: true });
        // Focus first error
        setTimeout(() => firstErrorRef.current?.focus(), 80);
        return;
      }

      setStatus("submitting");
      try {
        const result = await submitEnquiry(data, formOpenedAt.current);
        if (result.ok) {
          setStatus("success");
          onSuccess();
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [data, onSuccess]
  );

  const isSubmitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Enquiry form"
      className="flex flex-col space-y-0 w-full"
    >
      {/*
        ── Honeypot field ────────────────────────────────────────────────────
        Visually hidden via position/opacity — NOT display:none (bots ignore that).
        Real users never see or interact with this. Bots fill it automatically.
        The server rejects any submission where this field is non-empty.
        The label text "Website" is intentionally attractive to spam bots.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
        tabIndex={-1}
      >
        <label htmlFor="website-url">Website</label>
        <input
          id="website-url"
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          // This field intentionally has no value binding —
          // it is never read by the form handler.
          // The API service adds website: "" to the payload.
          defaultValue=""
        />
      </div>

      {/* ── Name ─────────────────────────────────────────────────── */}
      <Field
        id={`${uid}-name`}
        label="Your Name"
        error={touched.name ? errors.name : undefined}
        required
        setFirstErrorRef={
          errors.name && !errors.email && !errors.message
            ? (el) => { firstErrorRef.current = el; }
            : undefined
        }
      >
        <input
          id={`${uid}-name`}
          type="text"
          autoComplete="name"
          required
          disabled={isSubmitting}
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="Full name"
          className={fieldInputClass(!!errors.name && !!touched.name)}
        />
      </Field>

      {/* ── Email ────────────────────────────────────────────────── */}
      <Field
        id={`${uid}-email`}
        label="Email Address"
        error={touched.email ? errors.email : undefined}
        required
        setFirstErrorRef={
          !errors.name && errors.email
            ? (el) => { firstErrorRef.current = el; }
            : undefined
        }
      >
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          required
          disabled={isSubmitting}
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder="you@example.com"
          className={fieldInputClass(!!errors.email && !!touched.email)}
        />
      </Field>

      {/* ── Phone / WhatsApp ─────────────────────────────────────── */}
      <Field
        id={`${uid}-phone`}
        label="WhatsApp / Phone"
        hint="Optional"
        error={touched.phone ? errors.phone : undefined}
      >
        <input
          id={`${uid}-phone`}
          type="tel"
          autoComplete="tel"
          disabled={isSubmitting}
          value={data.phone ?? ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
          placeholder="+220 XXX XXXX"
          className={fieldInputClass(false)}
        />
      </Field>

      {/* ── Vehicle of interest ──────────────────────────────────── */}
      <Field
        id={`${uid}-vehicle`}
        label="Vehicle of Interest"
        hint="Optional — based on current selection"
        error={touched.vehicle ? errors.vehicle : undefined}
      >
        <div className="relative">
          <select
            id={`${uid}-vehicle`}
            disabled={isSubmitting}
            value={data.vehicle ?? ""}
            onChange={(e) => handleChange("vehicle", e.target.value)}
            onBlur={() => handleBlur("vehicle")}
            className={`${fieldInputClass(false)} appearance-none pr-8 bg-transparent cursor-pointer`}
          >
            <option value="">No preference</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          {/* Select arrow */}
          <div className="pointer-events-none absolute right-0 bottom-3 text-muted-grey/60">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </Field>

      {/* ── Message ──────────────────────────────────────────────── */}
      <Field
        id={`${uid}-message`}
        label="Tell Us What You Need"
        error={touched.message ? errors.message : undefined}
        required
        setFirstErrorRef={
          !errors.name && !errors.email && errors.message
            ? (el) => { firstErrorRef.current = el; }
            : undefined
        }
      >
        <textarea
          id={`${uid}-message`}
          required
          rows={4}
          disabled={isSubmitting}
          value={data.message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          placeholder="Dates, duration, any specific requirements..."
          className={`${fieldInputClass(!!errors.message && !!touched.message)} resize-none leading-relaxed`}
        />
      </Field>

      {/* ── Error state ──────────────────────────────────────────── */}
      {status === "error" && (
        <p
          role="alert"
          className="text-xs text-warm-sand/80 pt-4 tracking-wide font-light"
        >
          Something didn't go through. Please try again or reach out directly.
        </p>
      )}

      {/* ── Submit ───────────────────────────────────────────────── */}
      <div className="pt-8 sm:pt-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-4 py-4 sm:py-0 border-t border-white/10 sm:border-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative text-xs sm:text-[11px] uppercase tracking-[0.32em] text-warm-ivory group-hover:text-champagne-light transition-colors duration-300">
            {isSubmitting ? "Sending enquiry…" : "Send Enquiry"}
          </span>
          {/* Animated arrow */}
          {!isSubmitting && (
            <span
              aria-hidden="true"
              className="inline-flex items-center overflow-hidden"
            >
              <svg
                width="28"
                height="10"
                viewBox="0 0 28 10"
                fill="none"
                className="text-champagne/70 group-hover:text-champagne transition-all duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M0 5H26M22 1L26 5L22 9"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          {isSubmitting && (
            <span aria-hidden="true" className="inline-block w-4 h-4">
              <svg
                className="animate-spin text-champagne/60"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </span>
          )}
        </button>
        <p className="mt-4 sm:mt-3 text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-muted-grey/40">
          No commitment. No automated responses.
        </p>
      </div>
    </form>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fieldInputClass(hasError: boolean) {
  return [
    "w-full bg-transparent border-0 border-b pb-3 pt-1",
    "text-sm sm:text-base text-warm-ivory font-light placeholder:text-muted-grey/40",
    "focus:outline-none focus:ring-0 transition-colors duration-300",
    hasError
      ? "border-champagne/50 focus:border-champagne"
      : "border-white/[0.12] focus:border-white/35",
  ]
    .filter(Boolean)
    .join(" ");
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  setFirstErrorRef?: (el: HTMLElement | null) => void;
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  setFirstErrorRef,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="relative pt-7 pb-5 border-b border-white/[0.05]">
      {/* Label row */}
      <div className="flex items-baseline justify-between mb-0">
        <label
          htmlFor={id}
          className="text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-muted-grey/80 font-medium select-none"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-champagne/60">
              *
            </span>
          )}
        </label>
        {hint && !error && (
          <span className="text-[9px] uppercase tracking-[0.22em] text-muted-grey/40">
            {hint}
          </span>
        )}
        {error && (
          <span
            id={errorId}
            role="alert"
            className="text-[9px] uppercase tracking-[0.22em] text-champagne/80"
            ref={setFirstErrorRef as React.RefCallback<HTMLSpanElement>}
            tabIndex={-1}
          >
            {error}
          </span>
        )}
      </div>
      {/* Input */}
      <div aria-describedby={error ? errorId : undefined}>{children}</div>
    </div>
  );
}
