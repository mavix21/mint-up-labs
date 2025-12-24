# @myapp/features

A Feature Sliced Design (FSD) package for shared domain-specific components across the monorepo.

## Overview

This package follows the [Feature Sliced Design](https://feature-sliced.design) methodology to organize shared code that can be used across all apps (web, mini, lemon, expo).

**Key distinction from `@myapp/ui`:**

- `@myapp/ui` → Domain-agnostic design system components (Button, Card, Input, etc.)
- `@myapp/features` → Domain-specific features, widgets, and entities (UserCard, ConnectWallet, etc.)

## Layer Structure

FSD organizes code into layers with strict import rules (can only import from layers below):

```
┌─────────────────────────────────────────────────────────┐
│  app/       → Providers, configs, global initialization │
├─────────────────────────────────────────────────────────┤
│  widgets/   → Large UI blocks, page sections            │
├─────────────────────────────────────────────────────────┤
│  features/  → Reusable product features                 │
├─────────────────────────────────────────────────────────┤
│  entities/  → Business domain entities                  │
├─────────────────────────────────────────────────────────┤
│  shared/    → Foundation: lib, api, config, i18n        │
└─────────────────────────────────────────────────────────┘
```

## Segment Naming Convention

Each slice (feature, entity, widget) uses **purpose-based** segments:

| Segment   | Purpose                      |
| --------- | ---------------------------- |
| `ui/`     | React components             |
| `model/`  | Types, state, business logic |
| `api/`    | API interactions             |
| `lib/`    | Internal utilities           |
| `config/` | Feature flags, constants     |

**Avoid** generic names like `components/`, `hooks/`, `types/`, `utils/`.

## Usage

### Importing from layers

```tsx
// App-level providers
import type { User } from "@myapp/features/entities/user";
import type { WalletState } from "@myapp/features/features/connect-wallet";
import { ThemeProvider } from "@myapp/features/app/providers";
import { UserAvatar } from "@myapp/features/entities/user";
import {
  ConnectWalletButton,
  truncateAddress,
} from "@myapp/features/features/connect-wallet";
import { constants, featureFlags } from "@myapp/features/shared/config";
import { defaultLocale, isValidLocale } from "@myapp/features/shared/i18n";
// Shared utilities
import { invariant, isDefined } from "@myapp/features/shared/lib";
// Widgets
import { UserCard } from "@myapp/features/widgets/user-card";

// Features

// Entities
```

### Adding to your app

1. Add the package as a dependency:

```json
{
  "dependencies": {
    "@myapp/features": "workspace:*"
  }
}
```

2. Import and use components:

```tsx
// In your app's layout or providers
import { ThemeProvider } from "@myapp/features/app/providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

## Creating New Slices

### Adding a new feature

```bash
# Create the feature structure
mkdir -p src/features/my-feature/{ui,model,lib}

# Create barrel exports
touch src/features/my-feature/index.ts
touch src/features/my-feature/ui/index.ts
touch src/features/my-feature/model/index.ts
touch src/features/my-feature/lib/index.ts
```

Example feature structure:

```
src/features/my-feature/
├── index.ts           # Re-exports ui/, model/, lib/
├── ui/
│   ├── index.ts       # Exports components
│   └── my-button.tsx  # UI component
├── model/
│   ├── index.ts       # Exports types/hooks
│   └── types.ts       # Feature types
└── lib/
    ├── index.ts       # Exports utilities
    └── helpers.ts     # Feature utilities
```

### Adding a new widget

Widgets compose features and entities:

```tsx
// src/widgets/user-profile/ui/user-profile.tsx
import { UserAvatar } from "../../../entities/user";
import { truncateAddress } from "../../../features/connect-wallet";

export function UserProfile({ user, walletAddress }) {
  return (
    <div>
      <UserAvatar src={user.avatarUrl} name={user.name} />
      <span>{truncateAddress(walletAddress)}</span>
    </div>
  );
}
```

### Adding a new entity

Entities represent domain objects:

```
src/entities/wallet/
├── index.ts
├── ui/
│   ├── index.ts
│   └── wallet-badge.tsx
├── model/
│   ├── index.ts
│   └── types.ts
└── api/
    ├── index.ts
    └── queries.ts
```

## Import Rules

**Critical FSD principle:** A module can only import from layers **strictly below** it.

| Layer       | Can import from                     |
| ----------- | ----------------------------------- |
| `app/`      | widgets, features, entities, shared |
| `widgets/`  | features, entities, shared          |
| `features/` | entities, shared                    |
| `entities/` | shared                              |
| `shared/`   | nothing (external deps only)        |

**Slices on the same layer cannot import from each other.**

## Platform-Specific Code

Some code must remain in apps due to platform-specific dependencies:

- **ConvexClientProvider** → Requires app-specific `authClient` and `env`
- **MiniAppContext** → Farcaster SDK in `mini/`, Lemon SDK in `lemon/`
- **OnchainKitProvider** → Different configs per platform

Use this package for **truly shared** domain logic that works across all platforms.

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

## Resources

- [Feature Sliced Design Docs](https://feature-sliced.design)
- [FSD Examples](https://github.com/feature-sliced/examples)
