import type { NFT, WalletData } from "./types";

export const mockWallet: WalletData = {
  address: "0xDEAF...fB8B",
  balanceUSDC: 28.81,
};

export const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "Parallel Alpha",
    image: "/lemmy.png", // Placeholder or use a real placeholder service if needed, but keeping simple for now
    collectionName: "Universal Hired Gun",
  },
  {
    id: "2",
    name: "Banana",
    image: "/lemmy.png",
    collectionName: "Bored Ape Yacht Club",
  },
  {
    id: "3",
    name: "Azuki #1234",
    image: "/lemmy.png",
    collectionName: "Azuki",
  },
];
