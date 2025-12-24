import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

// Shared common messages from @mint-up/features
import commonEn from "@mint-up/features/shared/i18n/messages/en";
import commonEs from "@mint-up/features/shared/i18n/messages/es";

import { routing } from "./routing";

const sharedMessages = {
  en: commonEn,
  es: commonEs,
};

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const appMessages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...sharedMessages[locale],

      ...appMessages,
    },
  };
});
