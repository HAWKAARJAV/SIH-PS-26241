import { Button, Chip, EmptyState, IconArray, VerificationBadge } from "@/components/ui/primitives";

export default function DesignPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Warm clay</h1>
      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="quiet">Quiet</Button>
        <Chip active>Chip</Chip>
        <VerificationBadge tier="V0" />
      </div>
      <IconArray filled={7} />
      <EmptyState title="Empty, with a next step" body="Illustrations stay simple and local." />
    </div>
  );
}
