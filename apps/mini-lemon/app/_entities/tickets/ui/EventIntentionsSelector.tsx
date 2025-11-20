import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { Check } from "lucide-react";

import { cn } from "@mint-up/ui/lib/utils";

import type { EventIntention } from "../models/constants";
import {
  EVENT_INTENTION_METADATA,
  EVENT_INTENTION_OPTIONS,
} from "../models/constants";

/**
 * Context for managing event intentions selection state
 */
interface EventIntentionsSelectorContextValue {
  selectedIntentions: EventIntention[];
  onToggle: (intention: EventIntention) => void;
  isSelected: (intention: EventIntention) => boolean;
  maxSelections?: number;
  disabled?: boolean;
}

const EventIntentionsSelectorContext = createContext<
  EventIntentionsSelectorContextValue | undefined
>(undefined);

/**
 * Hook to access the EventIntentionsSelector context
 */
function useEventIntentionsSelector() {
  const context = useContext(EventIntentionsSelectorContext);
  if (!context) {
    throw new Error(
      "EventIntentionsSelector compound components must be used within EventIntentionsSelector",
    );
  }
  return context;
}

/**
 * Root Props for EventIntentionsSelector
 */
export interface EventIntentionsSelectorProps {
  value: EventIntention[];
  onValueChange: (intentions: EventIntention[]) => void;
  maxSelections?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Root component for EventIntentionsSelector
 * Manages the selection state and provides context to child components
 */
function EventIntentionsSelectorRoot({
  value,
  onValueChange,
  maxSelections,
  disabled = false,
  children,
}: EventIntentionsSelectorProps) {
  const handleToggle = (intention: EventIntention) => {
    if (disabled) return;

    const isCurrentlySelected = value.includes(intention);

    if (isCurrentlySelected) {
      // Remove from selection
      onValueChange(value.filter((i) => i !== intention));
    } else {
      // Add to selection if under max limit
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onValueChange([...value, intention]);
    }
  };

  const isSelected = (intention: EventIntention) => value.includes(intention);

  const contextValue = useMemo(
    () => ({
      selectedIntentions: value,
      onToggle: handleToggle,
      isSelected,
      maxSelections,
      disabled,
    }),
    [value, maxSelections, disabled],
  );

  return (
    <EventIntentionsSelectorContext.Provider value={contextValue}>
      <div className="flex flex-col gap-2">{children}</div>
    </EventIntentionsSelectorContext.Provider>
  );
}

/**
 * Container component for laying out intention options
 */
function EventIntentionsSelectorList({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/**
 * Props for individual intention option
 */
export interface EventIntentionsOptionProps {
  intention: EventIntention;
  showDescription?: boolean;
}

/**
 * Individual selectable intention option
 * Displays as a toggleable chip
 */
function EventIntentionsOption({
  intention,
  showDescription = false,
}: EventIntentionsOptionProps) {
  const { onToggle, isSelected, disabled } = useEventIntentionsSelector();
  const metadata = EVENT_INTENTION_METADATA[intention];
  const selected = isSelected(intention);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onToggle(intention)}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          selected
            ? "border-blue-600 bg-blue-500 text-white hover:bg-blue-600"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {metadata.label}
        {selected && <Check className="h-3.5 w-3.5" />}
      </button>
      {showDescription && (
        <p className="text-muted-foreground max-w-[150px] text-xs">
          {metadata.description}
        </p>
      )}
    </div>
  );
}

/**
 * Default list of all available intentions
 */
function EventIntentionsDefaultOptions({
  showDescription = false,
}: {
  showDescription?: boolean;
}) {
  return (
    <>
      {EVENT_INTENTION_OPTIONS.map((intention) => (
        <EventIntentionsOption
          key={intention}
          intention={intention}
          showDescription={showDescription}
        />
      ))}
    </>
  );
}

/**
 * Helper text component to display selection info
 */
interface EventIntentionsHelperTextProps {
  children?: React.ReactNode;
}

function EventIntentionsHelperText({
  children,
}: EventIntentionsHelperTextProps) {
  const { selectedIntentions, maxSelections } = useEventIntentionsSelector();

  return (
    <p className="text-muted-foreground text-sm">
      {children ||
        (maxSelections
          ? `Selected ${selectedIntentions.length} of ${maxSelections}`
          : `${selectedIntentions.length} selected`)}
    </p>
  );
}

/**
 * EventIntentionsSelector - Compound component for selecting event intentions
 *
 * @example
 * ```tsx
 * <EventIntentionsSelector value={intentions} onValueChange={setIntentions}>
 *   <EventIntentionsSelector.List>
 *     <EventIntentionsSelector.DefaultOptions />
 *   </EventIntentionsSelector.List>
 *   <EventIntentionsSelector.HelperText />
 * </EventIntentionsSelector>
 * ```
 *
 * Or with custom options:
 * ```tsx
 * <EventIntentionsSelector value={intentions} onValueChange={setIntentions} maxSelections={3}>
 *   <EventIntentionsSelector.List>
 *     <EventIntentionsSelector.Option intention="Networking" />
 *     <EventIntentionsSelector.Option intention="Learning" showDescription />
 *   </EventIntentionsSelector.List>
 *   <EventIntentionsSelector.HelperText>
 *     Choose up to 3 goals for this event
 *   </EventIntentionsSelector.HelperText>
 * </EventIntentionsSelector>
 * ```
 */
export const EventIntentionsSelector = Object.assign(
  EventIntentionsSelectorRoot,
  {
    List: EventIntentionsSelectorList,
    Option: EventIntentionsOption,
    DefaultOptions: EventIntentionsDefaultOptions,
    HelperText: EventIntentionsHelperText,
  },
);
