"use client";

import { useMemo, useState } from "react";
import type {
  ApplicantProfile,
  EligibilityPolicy,
  VerificationResponse,
} from "@/types";

const defaultApplicant: ApplicantProfile = {
  name: "Alex Johnson",
  dateOfBirth: "1992-04-14",
  passportNumber: "K1234567",
  nationality: "USA",
  visaType: "tourist",
  intendedTravelDate: "2025-06-01",
};

const defaultPolicy: EligibilityPolicy = {
  minPassportValidityDays: 180,
  minApplicantAge: 18,
  supportedVisaTypes: ["tourist", "business", "student"],
  blacklistedNationalities: ["IRN", "PRK"],
  requireNameMatch: true,
  requirePassportMatch: true,
};

type FieldKey = keyof VerificationResponse["extractedFields"];

export default function Home() {
  const [documents, setDocuments] = useState<File[]>([]);
  const [applicant, setApplicant] = useState<ApplicantProfile>(defaultApplicant);
  const [policy, setPolicy] = useState<EligibilityPolicy>(defaultPolicy);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResponse | null>(null);

  const supportedVisaTypes = useMemo(
    () => policy.supportedVisaTypes.join(", "),
    [policy.supportedVisaTypes],
  );
  const blacklistedNationalities = useMemo(
    () => policy.blacklistedNationalities.join(", "),
    [policy.blacklistedNationalities],
  );

  const handleDocumentInput = (files: FileList | null) => {
    if (!files) return;
    setDocuments(Array.from(files));
  };

  const updateApplicant = <K extends keyof ApplicantProfile>(
    key: K,
    value: ApplicantProfile[K],
  ) => {
    setApplicant((prev) => ({ ...prev, [key]: value }));
  };

  const updatePolicy = <K extends keyof EligibilityPolicy>(
    key: K,
    value: EligibilityPolicy[K],
  ) => {
    setPolicy((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      documents.forEach((file) => formData.append("documents", file));
      formData.append("applicant", JSON.stringify(applicant));
      formData.append("policy", JSON.stringify(policy));
      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Verification failed");
      }
      const payload = (await response.json()) as VerificationResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const prettyJson = useMemo(() => {
    if (!result) return "";
    return JSON.stringify(result, null, 2);
  }, [result]);

  const canSubmit = documents.length > 0 && !submitting;

  return (
    <main className="min-h-screen bg-slate-950 pb-20 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
              Agentic Document Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-white md:text-4xl">
              Government ID Verification & Visa Eligibility
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Upload passports, visas, national IDs, or driving licences. The
              verifier performs OCR, MRZ parsing, data validation, and evaluates
              visa eligibility based on your policy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDocuments([]);
              setResult(null);
              setError(null);
              setApplicant(defaultApplicant);
              setPolicy(defaultPolicy);
            }}
            className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-emerald-400/60 hover:text-white"
          >
            Reset Session
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1.3fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-semibold text-white">
              1. Upload Document Images
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Add front/back scans or photo captures of the travel document.
              High resolution images with visible MRZ yield the best accuracy.
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-400/60 bg-slate-900/40 p-8 text-center text-sm text-slate-300 transition hover:border-emerald-300 hover:bg-slate-900/70">
              <span className="font-medium text-emerald-200">
                Drag & drop or click to select files
              </span>
              <span className="mt-2 text-xs text-slate-400">
                Accepts .jpg, .png, .webp, .tiff, .bmp (max 10 files)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handleDocumentInput(event.target.files)}
                className="hidden"
              />
            </label>
            {!!documents.length && (
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {documents.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2"
                  >
                    <span className="truncate">
                      {file.name}{" "}
                      <span className="text-xs text-slate-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDocuments((prev) =>
                          prev.filter((candidate) => candidate.name !== file.name),
                        )
                      }
                      className="ml-4 text-xs text-emerald-300 transition hover:text-emerald-100"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-semibold text-white">
              2. Applicant Profile
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Full name
                </span>
                <input
                  value={applicant.name}
                  onChange={(event) => updateApplicant("name", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Date of birth
                </span>
                <input
                  type="date"
                  value={applicant.dateOfBirth}
                  onChange={(event) => updateApplicant("dateOfBirth", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Passport / document number
                </span>
                <input
                  value={applicant.passportNumber}
                  onChange={(event) =>
                    updateApplicant("passportNumber", event.target.value.toUpperCase())
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none uppercase"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Nationality (ISO alpha-3)
                </span>
                <input
                  value={applicant.nationality}
                  onChange={(event) =>
                    updateApplicant("nationality", event.target.value.toUpperCase())
                  }
                  maxLength={3}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none uppercase"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Visa type
                </span>
                <input
                  value={applicant.visaType}
                  onChange={(event) =>
                    updateApplicant("visaType", event.target.value.toLowerCase())
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm capitalize text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Intended travel date
                </span>
                <input
                  type="date"
                  value={applicant.intendedTravelDate}
                  onChange={(event) =>
                    updateApplicant("intendedTravelDate", event.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-semibold text-white">
              3. Eligibility Policy
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Min passport validity (days)
                </span>
                <input
                  type="number"
                  min={0}
                  value={policy.minPassportValidityDays}
                  onChange={(event) =>
                    updatePolicy("minPassportValidityDays", Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Min applicant age
                </span>
                <input
                  type="number"
                  min={0}
                  value={policy.minApplicantAge}
                  onChange={(event) =>
                    updatePolicy("minApplicantAge", Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Supported visa types (comma separated)
                </span>
                <input
                  value={supportedVisaTypes}
                  onChange={(event) =>
                    updatePolicy(
                      "supportedVisaTypes",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim().toLowerCase())
                        .filter(Boolean),
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none"
                  placeholder="tourist, business, student"
                />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Blacklisted nationalities (ISO alpha-3, comma separated)
                </span>
                <input
                  value={blacklistedNationalities}
                  onChange={(event) =>
                    updatePolicy(
                      "blacklistedNationalities",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim().toUpperCase())
                        .filter(Boolean),
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-emerald-400 focus:outline-none uppercase"
                  placeholder="IRN, PRK"
                />
              </label>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm md:col-span-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Require exact name match
                  </p>
                  <p className="text-xs text-slate-300">
                    Enforce strict comparison between applicant and document name.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePolicy("requireNameMatch", !policy.requireNameMatch)
                  }
                  className={`inline-flex h-8 w-16 items-center rounded-full border border-white/10 px-1 transition ${
                    policy.requireNameMatch
                      ? "justify-end bg-emerald-500/80"
                      : "justify-start bg-slate-800"
                  }`}
                >
                  <span className="h-6 w-6 rounded-full bg-white" />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm md:col-span-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Require passport number match
                  </p>
                  <p className="text-xs text-slate-300">
                    If disabled, mismatches become warnings instead of failures.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePolicy("requirePassportMatch", !policy.requirePassportMatch)
                  }
                  className={`inline-flex h-8 w-16 items-center rounded-full border border-white/10 px-1 transition ${
                    policy.requirePassportMatch
                      ? "justify-end bg-emerald-500/80"
                      : "justify-start bg-slate-800"
                  }`}
                >
                  <span className="h-6 w-6 rounded-full bg-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              {documents.length ? (
                <span>
                  Ready to process {documents.length} document
                  {documents.length > 1 ? "s" : ""}. Average response time: 6-10s.
                </span>
              ) : (
                <span>Add at least one document to begin verification.</span>
              )}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition disabled:cursor-not-allowed disabled:bg-emerald-900/50"
            >
              {submitting ? "Analyzing…" : "Run Verification"}
            </button>
          </div>
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10">
            <h2 className="text-lg font-semibold text-white">Verification Output</h2>
            {result ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-100">
                    {result.summary}
                  </p>
                  <p className="mt-1 text-xs text-emerald-200/80">
                    Overall confidence: {result.overallConfidence} · Decision:{" "}
                    <span className="uppercase text-emerald-200">
                      {result.eligibility.status}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Extracted Fields
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {(Object.keys(result.extractedFields) as FieldKey[]).map(
                      (key) => {
                        const field = result.extractedFields[key];
                        return (
                          <li
                            key={key}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
                          >
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                {field.label}
                              </p>
                              <p className="text-sm text-white">
                                {field.value ?? "—"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">
                                {field.source.toUpperCase()}
                              </p>
                              <p className="text-xs font-semibold text-emerald-300">
                                {field.confidence}%
                              </p>
                            </div>
                          </li>
                        );
                      },
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Validation Checks
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {result.validationChecks.map((check) => (
                      <li
                        key={check.id}
                        className="flex items-start justify-between rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold text-white">{check.label}</p>
                          <p className="mt-1 max-w-xs text-slate-300">
                            {check.details}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end text-right">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                              check.status === "pass"
                                ? "bg-emerald-500/20 text-emerald-200"
                                : check.status === "fail"
                                  ? "bg-red-500/20 text-red-200"
                                  : "bg-amber-500/20 text-amber-200"
                            }`}
                          >
                            {check.status}
                          </span>
                          <span className="mt-1 text-slate-400">
                            {check.confidence}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Recommended Actions
                  </h3>
                  <ul className="list-disc space-y-1 pl-4 text-slate-200">
                    {result.recommendedActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-6 text-sm text-slate-300">
                Results will appear here once verification is complete. Attach
                document images and run the analysis to get started.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Raw JSON Response
              </h2>
              {result && (
                <span className="text-xs text-slate-400">
                  {result.timingMs} ms · MRZ{" "}
                  {result.mrz?.checksumValid ? "valid" : "needs review"}
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={prettyJson}
              placeholder="Awaiting verification…"
              className="mt-3 h-64 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-100 shadow-inner focus:outline-none"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
