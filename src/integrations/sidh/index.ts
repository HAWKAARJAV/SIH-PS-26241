export interface SidhAdapter {
  courseUrl(tradeSlug: string, district: string): string;
}

export const sidhMock: SidhAdapter = {
  courseUrl(tradeSlug, district) {
    return `https://www.skillindiadigital.gov.in/?nourishTrade=${encodeURIComponent(tradeSlug)}&district=${encodeURIComponent(district)}`;
  },
};
