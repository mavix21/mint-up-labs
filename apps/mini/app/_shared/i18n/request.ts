import { getRequestConfig } from "next-intl/server";

import commonEn from "@mint-up/features/shared/i18n/messages/en";

import appEn from "./messages/en.json";

export default getRequestConfig(() => ({
  locale: "en",
  messages: { ...commonEn, ...appEn },
}));
