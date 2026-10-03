import { prisma } from "@/lib/db";
import { resolveEvidence } from "@/data/services/outcomes";

const PREVIEW_TRADE_SLUG = "electrician";
const PREVIEW_DISTRICT_ID = "d-neemganj";

export async function getLandingEvidencePreview(locale: string) {
  const trade = await prisma.trade.findFirst({ where: { slug: PREVIEW_TRADE_SLUG } });
  const district = await prisma.district.findFirst({
    where: { id: PREVIEW_DISTRICT_ID },
    include: { state: true },
  });
  if (!trade || !district) {
    return { card: null, tradeName: null, nsqfLevel: null, districtName: null, stateName: null };
  }
  const { card } = await resolveEvidence({
    tradeId: trade.id,
    districtId: district.id,
    stateId: district.stateId,
    locale,
  });
  return {
    card,
    tradeName: trade.name,
    nsqfLevel: trade.nsqfLevel,
    districtName: district.name,
    stateName: district.state.name,
  };
}
