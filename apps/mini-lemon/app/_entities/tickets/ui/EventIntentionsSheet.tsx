import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { Id } from "@mint-up/convex/_generated/dataModel";
import { api } from "@mint-up/convex/_generated/api";
import { useMutation } from "@mint-up/convex/react";
import { Button } from "@mint-up/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@mint-up/ui/components/drawer";

import type { EventIntention } from "../models/constants";
import { EventIntentionsSelector } from "./EventIntentionsSelector";

export interface EventIntentionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: Id<"events">;
  onComplete?: () => void;
}

/**
 * EventIntentionsSheet - A sheet component that prompts users to select their event intentions
 * after registration. This is presented as an optional but valuable step to unlock social features.
 *
 * Follows the product requirement: "After a user registers for an event, present them with an
 * optional, single-question prompt"
 */
export function EventIntentionsSheet({
  open,
  onOpenChange,
  eventId,
  onComplete,
}: EventIntentionsSheetProps) {
  const [selectedIntentions, setSelectedIntentions] = useState<
    EventIntention[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateIntentions = useMutation(
    api.registrations.updateRegistrationIntentions,
  );

  const handleSubmit = async () => {
    if (selectedIntentions.length === 0) {
      toast.error("Please select at least one intention");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateIntentions({
        eventId,
        eventIntentions: selectedIntentions,
      });

      toast.success("Your intentions have been saved!");

      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      console.error("Failed to update intentions:", error);
      toast.error("Failed to save intentions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    onComplete?.();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when sheet closes
      setSelectedIntentions([]);
    }
    onOpenChange(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="flex flex-col items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <DrawerTitle className="text-center text-xl">
              What are your goals for this event?
            </DrawerTitle>
            <DrawerDescription className="text-center text-base">
              Share your intentions to unlock the attendee directory and
              discover other attendees with similar goals
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-4 p-4">
            <EventIntentionsSelector
              value={selectedIntentions}
              onValueChange={setSelectedIntentions}
            >
              <EventIntentionsSelector.List>
                <EventIntentionsSelector.DefaultOptions />
              </EventIntentionsSelector.List>
              <EventIntentionsSelector.HelperText>
                Select all that apply
              </EventIntentionsSelector.HelperText>
            </EventIntentionsSelector>

            <div className="mt-4 flex w-full flex-col gap-2">
              <Button
                onClick={handleSubmit}
                disabled={selectedIntentions.length === 0 || isSubmitting}
                className={selectedIntentions.length === 0 ? "opacity-50" : ""}
                size="lg"
              >
                {isSubmitting ? "Saving..." : "Save & Unlock Directory"}
              </Button>

              <Button
                onClick={handleSkip}
                disabled={isSubmitting}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
