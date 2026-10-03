export interface SpeechAdapter {
  id: string;
  transcribe(note: string): Promise<{ text: string; simulated: boolean }>;
}

export const bhashiniMock: SpeechAdapter = {
  id: "bhashini",
  async transcribe() {
    return { text: "", simulated: true };
  },
};
