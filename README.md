# Mint Up Labs

Mint Up Labs is a comprehensive event management and ticketing platform built as a monorepo. The flagship application is **Mini Lemon**, a Mini App designed to run seamlessly within the Lemon Cash ecosystem.

## 🍋 Mini Lemon App

The **Mini Lemon** app (`apps/mini-lemon`) is a specialized experience integrated into the Lemon Cash wallet. It leverages Web3 technology to provide a secure and transparent ticketing solution on the Base Sepolia network.

### Key Features

- **Smart Wallet Integration**:
  - Creates a unique wallet for each Mini App using **ERC-6492**.
  - Users can easily **deposit** funds from their main Lemon wallet to the Mini App wallet.
  - Supports **withdrawals** back to the main wallet.
- **Event Discovery**: Users can browse and search for events across various categories such as Music, Business, Arts, and Tech.
- **Smart Ticketing**:
  - Support for both **Free** and **Paid** tickets.
  - Paid tickets are purchased using **USDC** on Base Sepolia.
  - Tickets are issued as NFTs, ensuring true ownership and verifiability.
- **My Events**: A dedicated section for users to view and manage their purchased tickets and upcoming events.
- **Digital Collection**: Users can view their collected NFTs and tokens directly within the app.
- **Event Creation**: Organizers can easily create and publish events:
  - **Online Events**: With link integration.
  - **In-Person Events**: With location details and instructions.

## 📦 Monorepo Structure

This repository is a pnpm monorepo managed with Turbo. It consists of the following main parts:

- `apps/mini-lemon`: The main Lemon Cash Mini App.
- `apps/web`: The web-based interface for the platform (Next.js).
- `packages/convex`: Backend logic, database schemas, and API functions powered by Convex.
- `packages/ui`: Shared UI component library based on shadcn/ui.
- `packages/s-contracts`: Smart contracts (Hardhat) for ticketing and event management.
- `tooling/`: Shared configurations for ESLint, Prettier, and TypeScript.

## 🧰 Tech Stack

- **Next.js 16 & Turbopack:** Modern, fast, and scalable React framework for the frontend.

- **Blockchain Integration (Web3):**
  - **Network**: Base Sepolia.
  - **Mini App SDK**: Utilizes `@lemoncash/mini-app-sdk` for integration with the Lemon ecosystem.
  - **Smart Wallets**: Implements ERC-6492 for app-specific wallet creation.
  - **Libraries**: Uses Wagmi and Viem for connecting to and interacting with EVM-compatible blockchains.
  - **Contracts**: Interacts with smart contracts deployed via the Hardhat project in `packages/s-contracts`.

- **Convex Backend:** Reactive backend-as-a-service for data storage, server functions, and real-time updates.

- **User Authentication:** Robust authentication system using NextAuth.js (`@auth/core`, `next-auth`) and Farcaster Auth Kit.

- **Rich Text Editing:** Includes a Tiptap-based rich text editor for content creation.

- **File Uploads & IPFS:** Supports file uploads with `react-dropzone`, using Pinata for decentralized storage on IPFS.

- **Internationalization (i18n):** Built with `next-intl` to support multiple languages.

- **Robust Form Handling:** Uses `react-hook-form` and `zod` for creating and validating forms.

- **Custom UI Library:** Leverages `@mint-up/ui` for a consistent look and feel, built with shadcn/ui components.

- **Server State Management:** Uses `@tanstack/react-query` for managing server state and caching.

- **Modern Tooling:** Includes ESLint, Prettier, TypeScript for code quality and development experience.
