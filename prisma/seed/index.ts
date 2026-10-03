import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { CARDS, DISTRICTS, SECTORS, SOURCES, STATES, TRADES } from "./catalog";
import { seedAnalytics } from "./analytics";
import { PLAYBOOK_OPENERS } from "../../src/ai/scripted/brain";
import type { ObjectionCode } from "../../src/ai/scripted/taxonomy";

const TAGS = [
  "INCOME_POTENTIAL", "JOB_SECURITY", "SOCIAL_STATUS", "WORK_SAFETY", "GIRLS_SAFETY_TRAVEL",
  "DEGREE_PREFERENCE", "GOVT_JOB_PREFERENCE", "COST_FEES", "DISTANCE_HOSTEL", "LOST_ACADEMIC_YEAR",
  "MARRIAGE_PROSPECTS", "MIGRATION_AWAY", "PROVIDER_TRUST_FRAUD", "CERTIFICATE_RECOGNITION",
  "AUTOMATION_FUTURE", "PHYSICAL_LABOUR_STIGMA", "LANGUAGE_LITERACY_BARRIER", "ELDER_VETO",
  "LEARNER_UNSURE", "OTHER",
] as const;

const prisma = new PrismaClient();

async function main() {
  await prisma.reportFlag.deleteMany();
  await prisma.evalRun.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.microSurvey.deleteMany();
  await prisma.evidenceView.deleteMany();
  await prisma.sentimentSample.deleteMany();
  await prisma.stanceSample.deleteMany();
  await prisma.objectionEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.escalationOutcome.deleteMany();
  await prisma.escalationNote.deleteMany();
  await prisma.escalationCase.deleteMany();
  await prisma.session.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.person.deleteMany();
  await prisma.family.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.outcomeStat.deleteMany();
  await prisma.providerTrade.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.progressionEdge.deleteMany();
  await prisma.fundingOption.deleteMany();
  await prisma.knowledgeCardTranslation.deleteMany();
  await prisma.knowledgeCard.deleteMany();
  await prisma.playbookEntry.deleteMany();
  await prisma.objectionTag.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.qualification.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.district.deleteMany();
  await prisma.state.deleteMany();
  await prisma.dataset.deleteMany();
  await prisma.source.deleteMany();
  await prisma.counsellor.deleteMany();
  await prisma.user.deleteMany();

  await prisma.source.createMany({ data: SOURCES.map((s) => ({ ...s })) });
  await prisma.state.createMany({ data: STATES.map((s) => ({ ...s })) });
  await prisma.district.createMany({ data: DISTRICTS.map((d) => ({ ...d, lgdCode: null })) });
  await prisma.sector.createMany({ data: SECTORS.map(([id, name]) => ({ id, name })) });

  const dataset = await prisma.dataset.create({
    data: {
      id: "ds-synthetic-1",
      version: 1,
      label: "Nourish synthetic baseline (illustrative)",
      status: "live",
      checksum: createHash("sha256").update("synthetic-v1").digest("hex"),
      kind: "synthetic",
      createdAt: "2026-10-03T00:00:00.000Z",
      note: "V0 demo data. Not an official statistic.",
    },
  });

  for (const [slug, name, sectorId, level, months, entry, feeMin, feeMax] of TRADES) {
    await prisma.trade.create({
      data: {
        id: `tr-${slug}`,
        slug,
        name,
        sectorId,
        nsqfLevel: level,
        nsqfFrameworkVersion: "NSQF-2023",
        durationMonths: months,
        entryQualification: entry,
        feesMinInr: feeMin,
        feesMaxInr: feeMax,
        summary: `${name} is a vocational path. Figures on this page are demo data until a steward verifies a dataset.`,
        dayInLife: `A ${name.toLowerCase()} trainee spends the morning on tools and the afternoon on a supervised job. The day ends with a short log of what was learned.`,
        safetyNotes: "Ask to see protective gear, a first-aid box, and who supervises the workshop.",
        notFor: `This path is a poor fit if the learner cannot meet the entry class, cannot travel to the centre, or needs a guarantee of a government job.`,
        pros: "Hands-on skill, a visible ladder, and a certificate you can ask to verify.",
        cons: "Early earnings can be uneven. Social pressure at home is common.",
        womenLens: "Ask about hostel, transport, washrooms, and whether women trainees are in the current batch.",
        icon: slug,
        tags: slug === "sewing" || slug === "beauty" || slug === "gda" ? "women_friendly" : "",
        roles: {
          create: [
            { id: `role-${slug}-1`, title: `Junior ${name}`, summary: "Works under a senior on routine tasks." },
            { id: `role-${slug}-2`, title: `${name} technician`, summary: "Handles standard jobs and explains options to a customer." },
          ],
        },
        quals: {
          create: [{ id: `qual-${slug}`, name: `${name} qualification`, nqrId: null, qpCode: null }],
        },
      },
    });
  }

  const providerNames = [
    "Neemganj Government ITI", "Suryapur Government ITI", "Kalyanbagh Government ITI", "Loharpur Government ITI",
    "Mangoan Government ITI", "Varadpur Government ITI", "Sahyadri Nagar Government ITI", "Talewadi Government ITI",
    "Thenpadi Government ITI", "Marudham Government ITI", "Kaveryoor Government ITI", "Mullai Girls ITI",
    "Gangauli Government ITI", "Sonpurwa Government ITI", "Mithilapur Government ITI", "Baghpur Government ITI",
    "Marugarh Government ITI", "Pushpnagar Government ITI", "Aravalli Basti Government ITI", "Registan Gaon Government ITI",
    "Malnadpet Government ITI", "Kaveri Dock Government ITI", "Bayaluseeme Government ITI", "Hasiru Halli Government ITI",
    "Courtyard Private ITI", "Riverbend Private ITI", "Lampwork NSTI Annexe", "Field PMKVY Centre",
    "Old Mill Polytechnic Wing", "Quiet Lane Training Centre",
  ];
  const weak = new Set(["Courtyard Private ITI", "Quiet Lane Training Centre"]);
  for (let i = 0; i < providerNames.length; i++) {
    const district = DISTRICTS[i % DISTRICTS.length]!;
    const name = providerNames[i]!;
    const provider = await prisma.provider.create({
      data: {
        id: `pv-${i + 1}`,
        name,
        type: name.includes("Private") ? "PRIVATE_ITI" : name.includes("NSTI") ? "NSTI" : name.includes("PMKVY") ? "PMKVY_TC" : name.includes("Polytechnic") ? "POLYTECHNIC" : "GOVT_ITI",
        districtId: district.id,
        fictional: true,
        girlsOnly: name.includes("Girls"),
        hostel: i % 3 === 0,
        transport: i % 2 === 0,
        facilities: "Workshops, drinking water, and a notice board. Fictional campus for the demo.",
        accreditation: "Listed in the synthetic dataset only. Verify on the official register.",
        contactPhone: "08000000000",
        address: `${name}, ${district.name}`,
        weak: weak.has(name),
      },
    });
    const tradeA = TRADES[i % TRADES.length]!;
    const tradeB = TRADES[(i + 3) % TRADES.length]!;
    for (const trade of [tradeA, tradeB]) {
      await prisma.providerTrade.create({
        data: { id: `pt-${provider.id}-${trade[0]}`, providerId: provider.id, tradeId: `tr-${trade[0]}`, seats: 20 + (i % 15) },
      });
    }
    if (district.id !== "d-loharpur") {
      await prisma.outcomeStat.create({
        data: {
          id: `out-p-${provider.id}`,
          scope: "provider",
          tradeId: `tr-${tradeA[0]}`,
          providerId: provider.id,
          districtId: district.id,
          stateId: district.stateId,
          cohortPeriod: "Apr 2024 – Mar 2025",
          cohortSize: weak.has(name) ? 24 : 36 + (i % 20),
          placementRate: weak.has(name) ? 0.22 : 0.55 + (i % 5) * 0.05,
          placementWindowMonths: 6,
          earningsP25: weak.has(name) ? 7000 : 11000 + (i % 4) * 500,
          earningsMedian: weak.has(name) ? 9000 : 15000 + (i % 4) * 800,
          earningsP75: weak.has(name) ? 12000 : 20000 + (i % 4) * 900,
          womenPlacementRate: 0.4 + (i % 3) * 0.05,
          tier: "V0",
          status: "live",
          sourceId: "src-demo",
          datasetId: dataset.id,
          lastVerifiedAt: "2026-10-03",
          verifiedBy: "seed",
          placedDefinition: "In wage work, apprenticeship, or own work within 6 months of finishing.",
        },
      });
    }
  }

  for (const [slug] of TRADES) {
    for (const state of STATES.slice(0, 4)) {
      await prisma.outcomeStat.create({
        data: {
          id: `out-s-${state.code}-${slug}`,
          scope: "state",
          tradeId: `tr-${slug}`,
          stateId: state.id,
          cohortPeriod: "Apr 2024 – Mar 2025",
          cohortSize: 180,
          placementRate: 0.62,
          placementWindowMonths: 6,
          earningsP25: 12000,
          earningsMedian: 16000,
          earningsP75: 22000,
          womenPlacementRate: 0.54,
          tier: "V0",
          status: "live",
          sourceId: "src-demo",
          datasetId: dataset.id,
          placedDefinition: "In wage work, apprenticeship, or own work within 6 months of finishing.",
        },
      });
    }
  }

  for (const district of DISTRICTS) {
    if (district.id === "d-loharpur" || district.id === "d-registan") continue;
    const slug = TRADES[district.name.length % TRADES.length]![0];
    await prisma.outcomeStat.create({
      data: {
        id: `out-d-${district.id}`,
        scope: "district",
        tradeId: `tr-${slug}`,
        districtId: district.id,
        stateId: district.stateId,
        cohortPeriod: "Apr 2024 – Mar 2025",
        cohortSize: district.rural ? 28 : 70,
        placementRate: district.id === "d-mullai" || district.id === "d-kaveryoor" ? 0.41 : 0.66,
        placementWindowMonths: 6,
        earningsP25: 10000,
        earningsMedian: district.rural ? 14000 : 17000,
        earningsP75: 21000,
        womenPlacementRate: district.id === "d-mullai" ? 0.33 : 0.58,
        tier: "V0",
        status: "live",
        sourceId: "src-demo",
        datasetId: dataset.id,
        placedDefinition: "In wage work, apprenticeship, or own work within 6 months of finishing.",
      },
    });
  }

  await prisma.outcomeStat.createMany({
    data: [
      {
        id: "out-plfs-men",
        scope: "state",
        cohortPeriod: "PLFS 2025",
        cohortSize: 0,
        earningsMedian: 24217,
        tier: "V1",
        status: "pending_verification",
        sourceId: "src-plfs",
        datasetId: dataset.id,
        placedDefinition: "Not a placement rate. Regular wage/salaried workers, men, secondary citation.",
        stateId: "st-up",
      },
      {
        id: "out-plfs-women",
        scope: "state",
        cohortPeriod: "PLFS 2025",
        cohortSize: 0,
        earningsMedian: 18353,
        tier: "V1",
        status: "pending_verification",
        sourceId: "src-plfs",
        datasetId: dataset.id,
        placedDefinition: "Not a placement rate. Regular wage/salaried workers, women, secondary citation.",
        stateId: "st-up",
      },
      {
        id: "out-plfs-note",
        scope: "state",
        cohortPeriod: "PLFS 2025",
        cohortSize: 0,
        tier: "V1",
        status: "pending_verification",
        sourceId: "src-plfs",
        datasetId: dataset.id,
        placedDefinition: "Hide until a data steward checks MoSPI.",
        stateId: "st-mh",
      },
    ],
  });

  for (const [slug, name, , level] of TRADES) {
    await prisma.progressionEdge.create({
      data: {
        id: `edge-${slug}-app`,
        fromTradeId: `tr-${slug}`,
        toLabel: `${name} apprenticeship`,
        kind: "APPRENTICESHIP",
        nsqfLevel: level,
        requirements: "Finish the course and find an NSQF-aligned seat. Stipend only if the dataset lists it.",
        creditHint: "Apprenticeship credits may be banked under NCrF. Confirm on ABC.",
        sourceId: "src-naps",
        sortOrder: 1,
      },
    });
    await prisma.progressionEdge.create({
      data: {
        id: `edge-${slug}-bridge`,
        fromTradeId: `tr-${slug}`,
        toLabel: "Diploma or degree bridge",
        kind: "ACADEMIC_BRIDGE",
        requirements: "Ask the polytechnic or university which credits they accept.",
        creditHint: "1 credit = 30 notional hours under NCrF.",
        sourceId: "src-ncrf",
        sortOrder: 2,
      },
    });
  }

  await prisma.fundingOption.createMany({
    data: [
      { id: "fund-pmsetu", name: "PM-SETU", summary: "Upgrades government ITIs. It is not a personal scholarship.", sourceId: "src-pmsetu", appliesNote: "Use for facility and status questions." },
      { id: "fund-naps", name: "NAPS-2", summary: "Employer reimbursement of 25% of prescribed stipend, capped at ₹1,500 per apprentice per month.", sourceId: "src-naps", appliesNote: "Show a stipend only from the dataset." },
    ],
  });

  for (const card of CARDS) {
    await prisma.knowledgeCard.create({
      data: {
        id: `card-${card.slug}`,
        slug: card.slug,
        title: card.title,
        body: card.body,
        topic: card.topic,
        tier: card.sourceId ? "V2" : "V0",
        sourceId: card.sourceId ?? "src-demo",
        reviewStatus: "reviewed",
        translations: {
          create: (["hi", "mr", "ta"] as const).map((locale) => ({
            id: `ct-${card.slug}-${locale}`,
            locale,
            title: card.title,
            body: card.body,
            reviewStatus: "machine",
          })),
        },
      },
    });
  }

  for (const code of TAGS) {
    await prisma.objectionTag.create({
      data: { id: `tag-${code}`, code, labelEn: code.replaceAll("_", " ").toLowerCase() },
    });
    for (const locale of ["en", "hi", "mr", "ta"] as const) {
      const pack = PLAYBOOK_OPENERS[locale] ?? PLAYBOOK_OPENERS.en;
      const opener = pack[code as ObjectionCode];
      await prisma.playbookEntry.create({
        data: {
          id: `pb-${code}-${locale}`,
          tagId: `tag-${code}`,
          opener,
          caveat: "Past cohorts are not a promise for this learner.",
          analogy: "A ladder has more than one rung. You can stop, turn, or climb.",
          nextStep: "Pick one trade, one district, and one question for the centre.",
          escalateIf: "The same worry stays open, or anyone is in distress.",
          evidenceHint: "Use outcome slots only. Never type a fresh number.",
          locale,
          reviewStatus: locale === "en" ? "reviewed" : "machine",
        },
      });
    }
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "nourish-demo-admin", 10);
  const users = [
    ["usr-admin", "admin@nourish.local", "Asha Admin", "ADMIN", null],
    ["usr-state", "state@nourish.local", "State Desk", "STATE_ADMIN", "UP"],
    ["usr-counsellor", "counsellor@nourish.local", "Meera Iyer", "COUNSELLOR", null],
    ["usr-steward", "steward@nourish.local", "Data Steward", "DATA_STEWARD", null],
    ["usr-viewer", "viewer@nourish.local", "Viewer", "VIEWER", null],
  ] as const;
  for (const [id, email, name, role, stateCode] of users) {
    await prisma.user.create({ data: { id, email, name, role, passwordHash, stateCode } });
  }
  const counsellors = [
    ["c1", "Meera Iyer", "en,hi,ta", "d-thenpadi,d-mullai", "usr-counsellor"],
    ["c2", "Rafiq Ansari", "hi", "d-neemganj,d-loharpur", null],
    ["c3", "Smita Kulkarni", "mr,hi", "d-mangoan,d-talewadi", null],
    ["c4", "Lakshmi Selvam", "ta", "d-kaveryoor,d-marudham", null],
    ["c5", "Nitish Kumar", "hi", "d-gangauli,d-sonpurwa", null],
    ["c6", "Fatima Sheikh", "en,hi", "d-marugarh,d-hasiru", null],
  ] as const;
  for (const [cid, name, languages, districts, userId] of counsellors) {
    await prisma.counsellor.create({
      data: { id: cid, name, languages, districts, available: true, phone: "08000001111", userId },
    });
  }

  await prisma.intervention.create({
    data: {
      id: "int-mullai",
      districtId: "d-mullai",
      title: "Hostel and daytime bus briefings",
      action: "Help desk explained hostel seats and a daytime bus. Synthetic log.",
      startedAt: "2026-06-01",
      status: "active",
      synthetic: true,
    },
  });

  await seedAnalytics(prisma);
  console.warn(`Seeded ${CARDS.length} knowledge cards, ${providerNames.length} providers.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
