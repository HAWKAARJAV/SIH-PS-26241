import { describe, expect, it } from "vitest";
import { nextObjectionStatus } from "@/ai/objections/lifecycle";
import { allowListForTurn } from "@/ai/guard/allow-list";
import { eventsSince, publish, resetRoomBus, subscribe } from "@/realtime/room-bus";
import { readParticipant, signParticipant } from "@/lib/participant";

describe("room bus", () => {
  it("delivers a message to a subscriber and resumes after an id", () => {
    resetRoomBus();
    const seen: string[] = [];
    const stop = subscribe("s1", (event) => seen.push(event.type));
    const first = publish("s1", "message.created", { id: "m1" });
    publish("s1", "disha.done", { id: "m2" });
    stop();
    publish("s1", "presence.left", {});
    expect(seen).toEqual(["message.created", "disha.done"]);
    expect(eventsSince("s1", first.id).map((event) => event.type)).toEqual(["disha.done", "presence.left"]);
  });
});

describe("participant token", () => {
  it("round-trips a parent role and rejects a bad signature", () => {
    const token = signParticipant("session-12345678", "PARENT");
    expect(readParticipant(token)?.role).toBe("PARENT");
    expect(readParticipant(`${token}x`)).toBeNull();
  });
});

describe("objection lifecycle", () => {
  it("moves open to addressed when evidence is shown, then resolved when cleared", () => {
    expect(nextObjectionStatus({ current: "open", answeredWithEvidence: true, speakerClearedIt: false })).toBe("addressed");
    expect(nextObjectionStatus({ current: "addressed", answeredWithEvidence: false, speakerClearedIt: true })).toBe("resolved");
    expect(nextObjectionStatus({ current: "open", answeredWithEvidence: false, speakerClearedIt: false })).toBe("open");
  });
});

describe("named allow list", () => {
  it("keeps class numbers and numbers the user just wrote", () => {
    expect(allowListForTurn("I finished class 11")).toEqual(expect.arrayContaining(["10", "12", "11"]));
  });
});
