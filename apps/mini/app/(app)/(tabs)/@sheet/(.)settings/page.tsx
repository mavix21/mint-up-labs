import { SettingsContent } from "@/pages/settings/settings-content";
import { BottomSheetRoute } from "@/shared/ui/bottom-sheet-route";

/**
 * Intercepting route for /settings.
 * Shows settings as a bottom sheet on soft navigation.
 * Server component with BottomSheetRoute wrapper (donut pattern).
 */
export default function SettingsSheetPage() {
  return (
    <BottomSheetRoute route="/settings">
      <SettingsContent />
    </BottomSheetRoute>
  );
}
