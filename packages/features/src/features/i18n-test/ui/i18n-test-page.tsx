"use client";

import { useTranslations } from "next-intl";

/**
 * Shared i18n test page component.
 * Demonstrates localization across all apps.
 */
export function I18nTestPage() {
  const t = useTranslations("i18nTest");
  const tCommon = useTranslations("common");

  return (
    <div className="from-background to-muted min-h-screen bg-linear-to-b p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </header>

        {/* Common translations section */}
        <section className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{t("sections.common")}</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">common.loading:</dt>
              <dd className="text-muted-foreground">{tCommon("loading")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">common.not_available:</dt>
              <dd className="text-muted-foreground">
                {tCommon("not_available")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">common.logo:</dt>
              <dd className="text-muted-foreground">{tCommon("logo")}</dd>
            </div>
          </dl>
        </section>

        {/* Page-specific translations section */}
        <section className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {t("sections.pageSpecific")}
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">{t("labels.greeting")}:</dt>
              <dd className="text-muted-foreground">{t("values.greeting")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">{t("labels.farewell")}:</dt>
              <dd className="text-muted-foreground">{t("values.farewell")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">{t("labels.welcome")}:</dt>
              <dd className="text-muted-foreground">{t("values.welcome")}</dd>
            </div>
          </dl>
        </section>

        {/* Numbers and formatting */}
        <section className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {t("sections.examples")}
          </h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-1">
            <li>{t("examples.one")}</li>
            <li>{t("examples.two")}</li>
            <li>{t("examples.three")}</li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="text-muted-foreground text-center text-sm">
          {t("footer")}
        </footer>
      </div>
    </div>
  );
}
