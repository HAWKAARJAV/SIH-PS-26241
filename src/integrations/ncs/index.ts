export interface NcsAdapter {
  searchUrl(role: string): string;
}

export const ncsMock: NcsAdapter = {
  searchUrl(role) {
    return `https://www.ncs.gov.in/?nourishRole=${encodeURIComponent(role)}`;
  },
};
