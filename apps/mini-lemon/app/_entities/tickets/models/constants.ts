/**
 * Available event intention options that users can select to indicate their goals for attending an event.
 * These intentions help facilitate social discovery and networking by allowing attendees to find
 * others with aligned goals.
 */
export const EVENT_INTENTION_OPTIONS = [
  "Networking",
  "Hiring Talent",
  "Seeking Investment",
  "Exploring Opportunities",
  "Learning",
] as const;

export type EventIntention = (typeof EVENT_INTENTION_OPTIONS)[number];

/**
 * Display metadata for each event intention option.
 * Includes friendly labels and descriptions to help users understand what each intention means.
 */
export const EVENT_INTENTION_METADATA: Record<
  EventIntention,
  {
    label: string;
    description: string;
    icon: string;
    color: string;
  }
> = {
  Networking: {
    label: "Networking",
    description: "Connect with like-minded professionals",
    icon: "🤝",
    color: "$blue3",
  },
  "Hiring Talent": {
    label: "Hiring Talent",
    description: "Looking to build your team",
    icon: "💼",
    color: "$purple3",
  },
  "Seeking Investment": {
    label: "Seeking Investment",
    description: "Exploring funding opportunities",
    icon: "💰",
    color: "$green3",
  },
  "Exploring Opportunities": {
    label: "Exploring Opportunities",
    description: "Open to new partnerships and collaborations",
    icon: "🔍",
    color: "$orange3",
  },
  Learning: {
    label: "Learning",
    description: "Here to learn and grow",
    icon: "📚",
    color: "$yellow3",
  },
};
