import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|hi|mr|ta)/:path*", "/((?!api|admin|counsellor|api-docs|_next|icons|samples|templates|manifest|.*\\..*).*)"],
};
