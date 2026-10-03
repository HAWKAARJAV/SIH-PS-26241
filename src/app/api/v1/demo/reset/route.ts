import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  await prisma.message.deleteMany();
  await prisma.objectionEvent.deleteMany();
  await prisma.sentimentSample.deleteMany();
  await prisma.stanceSample.deleteMany();
  await prisma.evidenceView.deleteMany();
  await prisma.microSurvey.deleteMany();
  await prisma.escalationOutcome.deleteMany();
  await prisma.escalationNote.deleteMany();
  await prisma.escalationCase.deleteMany();
  await prisma.session.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.person.deleteMany();
  await prisma.family.deleteMany();
  return NextResponse.json({ ok: true });
}
