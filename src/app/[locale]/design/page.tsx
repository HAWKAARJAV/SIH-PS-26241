"use client";

import {
  Button,
  Chip,
  EmptyState,
  IconArray,
  RangeBar,
  VerificationBadge,
  Courtyard,
} from "@/components/ui/primitives";
import { ChatBubble, QuickReplyChips, TypingIndicator } from "@/components/ui/chat";
import { ConsensusMeter, ProgressRing, StageStepper } from "@/components/ui/meter";
import { TradeCard } from "@/components/ui/trade-card";
import { TradeIcon } from "@/components/ui/trade-icon";
import { VoiceButton } from "@/components/ui/voice";
import { SourceStrip } from "@/components/evidence/drawer";

const demoTrade = {
  slug: "electrician",
  name: "Electrician",
  nsqfLevel: "4",
  durationMonths: 24,
  entryQualification: "Class 10",
};

export default function DesignPage() {
  return (
    <div className="space-y-10 pb-12">
      <header>
        <h1 className="font-display text-5xl">Warm Clay</h1>
        <p className="prose-measure mt-2 text-muted">Internal gallery for §8.8 components. Light mode only.</p>
      </header>

      <section>
        <h2 className="font-display text-3xl">Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="quiet">Quiet</Button>
          <Chip active>Active chip</Chip>
          <Chip>Chip</Chip>
          <VoiceButton onListen={() => undefined} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl">Evidence</h2>
        <div className="mt-3 flex flex-wrap items-end gap-6">
          <VerificationBadge tier="V0" />
          <VerificationBadge tier="V2" />
          <IconArray filled={7} />
          <RangeBar p25={12000} median={16000} p75={22000} />
        </div>
        <SourceStrip title="Nourish synthetic baseline" url="https://example.com" period="2025–26" n={42} />
      </section>

      <section>
        <h2 className="font-display text-3xl">Chat</h2>
        <div className="mt-3 max-w-xl space-y-3">
          <ChatBubble role="PARENT" label="Parent"><p>Will this trade feed our family?</p></ChatBubble>
          <ChatBubble role="DISHA" label="Disha · AI guide"><p>That is a fair worry. Let us look at local figures together.</p></ChatBubble>
          <TypingIndicator />
          <QuickReplyChips chips={["Fees?", "Safety?"]} onPick={() => undefined} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl">Meters</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <ProgressRing value={64} label="Example progress" />
          <ConsensusMeter openConcerns={2} alignment="One shared worry" />
        </div>
        <StageStepper stages={["Understand", "Explore", "Compare", "Decide", "Plan"]} current="Explore" />
      </section>

      <section>
        <h2 className="font-display text-3xl">Cards</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <TradeCard trade={demoTrade} />
          <EmptyState title="Empty, with a next step" body="Illustrations stay simple and local." action={<Button variant="quiet">Explore trades</Button>} />
        </div>
        <Courtyard className="mt-4 h-20 w-20" />
        <TradeIcon slug="sewing" className="mt-4" />
      </section>
    </div>
  );
}
