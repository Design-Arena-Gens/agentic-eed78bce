import { NextRequest, NextResponse } from "next/server";
import { verifyDocuments } from "@/lib/document";
import type { ApplicantProfile, EligibilityPolicy } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const FALLBACK_POLICY: EligibilityPolicy = {
  minPassportValidityDays: 180,
  minApplicantAge: 18,
  supportedVisaTypes: ["tourist", "business", "student"],
  blacklistedNationalities: [],
  requireNameMatch: true,
  requirePassportMatch: true,
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData
      .getAll("documents")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (!files.length) {
      return NextResponse.json(
        { error: "No document files were uploaded" },
        { status: 400 },
      );
    }

    const applicantRaw = formData.get("applicant");
    const policyRaw = formData.get("policy");

    if (!applicantRaw || typeof applicantRaw !== "string") {
      return NextResponse.json(
        { error: "Applicant payload missing" },
        { status: 400 },
      );
    }

    let applicant: ApplicantProfile;
    let policy: EligibilityPolicy = FALLBACK_POLICY;

    try {
      applicant = JSON.parse(applicantRaw) as ApplicantProfile;
    } catch {
      return NextResponse.json(
        { error: "Invalid applicant payload" },
        { status: 400 },
      );
    }

    if (policyRaw && typeof policyRaw === "string") {
      try {
        const parsed = JSON.parse(policyRaw) as Partial<EligibilityPolicy>;
        policy = { ...FALLBACK_POLICY, ...parsed };
      } catch {
        // keep fallback policy
      }
    }

    const result = await verifyDocuments(files, applicant, policy);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Verification error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

