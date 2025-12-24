import { ArticleContent } from "@/pages/article/article-content";
import { LongSheetRoute } from "@/shared/ui/long-sheet-route";
import { SheetDismissButton } from "@/shared/ui/sheet-dismiss-button";

/**
 * Intercepting route for /article (soft navigation).
 * Server component that renders ArticleContent server-side,
 * wrapped in client LongSheetRoute for routing (donut pattern).
 */
export default function ArticleSheetPage() {
  return (
    <LongSheetRoute route="/article">
      <ArticleContent dismissButton={<SheetDismissButton />} />
    </LongSheetRoute>
  );
}
