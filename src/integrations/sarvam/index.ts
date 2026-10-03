import type { SpeechAdapter } from "../bhashini";

export const sarvamMock: SpeechAdapter = {
  id: "sarvam",
  async transcribe() {
    return { text: "", simulated: true };
  },
};
