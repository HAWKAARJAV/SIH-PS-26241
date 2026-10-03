export interface DigilockerAdapter {
  /** Mock only. Never sends Aadhaar. */
  status(): "simulated";
}

export const digilockerMock: DigilockerAdapter = {
  status() {
    return "simulated";
  },
};
