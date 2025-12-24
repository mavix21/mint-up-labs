import { getRequestConfig } from "next-intl/server";

import commonEs from "@mint-up/features/shared/i18n/messages/es";

import appEs from "./messages/es.json";

export default getRequestConfig(async () => ({
  locale: "es",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  messages: { ...commonEs, ...appEs },
}));
