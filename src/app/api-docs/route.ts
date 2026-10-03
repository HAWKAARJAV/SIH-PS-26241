import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: { title: "Nourish API", version: "1.0.0" },
  paths: {
    "/api/health": { get: { summary: "Health" } },
    "/api/v1/families": { post: { summary: "Create a family room" } },
    "/api/v1/chat": { post: { summary: "One counselling turn" } },
    "/api/v1/join": { post: { summary: "Join by 6-digit code" } },
    "/api/v1/escalations": { post: { summary: "Request a counsellor" } },
    "/api/v1/import": { post: { summary: "Dry-run an outcome import" } },
    "/api/v1/rights": { post: { summary: "Delete data or withdraw consent" } },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
