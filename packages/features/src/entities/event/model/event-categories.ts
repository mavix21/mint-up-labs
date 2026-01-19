import type { LucideIcon } from "lucide-react";
import {
  BriefcaseIcon,
  ClapperboardIcon,
  CodeIcon,
  DumbbellIcon,
  Gamepad2Icon,
  GraduationCapIcon,
  HeartIcon,
  HouseHeartIcon,
  MusicIcon,
  PaletteIcon,
  PartyPopperIcon,
  PlaneIcon,
  PuzzleIcon,
  SparklesIcon,
  SquircleIcon,
  UtensilsIcon,
} from "lucide-react";

import type { Event } from "./event.type";

export type EventCategory = Event["category"];

const makeCategory = (
  localizedLabels: { en: string; es: string },
  icon: LucideIcon,
) => ({ label: localizedLabels.en, localizedLabels, icon });

export const EVENT_CATEGORIES_MAP = {
  "arts & culture": makeCategory(
    { en: "Arts & Culture", es: "Artes y cultura" },
    PaletteIcon,
  ),
  "business & professional": makeCategory(
    { en: "Business & Professional", es: "Negocios y profesional" },
    BriefcaseIcon,
  ),

  "education & learning": makeCategory(
    { en: "Education & Learning", es: "Educación y aprendizaje" },
    GraduationCapIcon,
  ),
  "food & drink": makeCategory(
    { en: "Food & Drink", es: "Comida y bebida" },
    UtensilsIcon,
  ),
  "fashion & beauty": makeCategory(
    { en: "Fashion & Beauty", es: "Moda y belleza" },
    SparklesIcon,
  ),
  "film & media": makeCategory(
    { en: "Film & Media", es: "Cine y medios" },
    ClapperboardIcon,
  ),
  gaming: makeCategory({ en: "Gaming", es: "Juegos" }, Gamepad2Icon),
  "health & wellness": makeCategory(
    { en: "Health & Wellness", es: "Salud y bienestar" },
    HeartIcon,
  ),
  "hobbies & interests": makeCategory(
    { en: "Hobbies & Interests", es: "Pasatiempos e intereses" },
    PuzzleIcon,
  ),
  "music & performing arts": makeCategory(
    { en: "Music & Performing Arts", es: "Música y artes escénicas" },
    MusicIcon,
  ),
  other: makeCategory({ en: "Other", es: "Otros" }, SquircleIcon),
  "parties & socials": makeCategory(
    { en: "Parties & Socials", es: "Fiestas y sociales" },
    PartyPopperIcon,
  ),
  "sports & fitness": makeCategory(
    { en: "Sports & Fitness", es: "Deportes y fitness" },
    DumbbellIcon,
  ),
  tech: makeCategory({ en: "Tech", es: "Tecnología" }, CodeIcon),
  "travel & outdoor": makeCategory(
    { en: "Travel & Outdoor", es: "Viajes y aire libre" },
    PlaneIcon,
  ),
  "community & causes": makeCategory(
    { en: "Community & Causes", es: "Comunidad y causas" },
    HouseHeartIcon,
  ),
} as const satisfies Record<EventCategory, unknown>;
