"use client";

import type { NFT } from "../models/types";
import { NFT as NFTCard } from "./nft-card";

interface NFTGridProps {
  items: NFT[];
}

export function NFTGrid({ items }: NFTGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 pb-20">
      {items.map((item) => (
        <NFTCard key={item.id}>
          {/* Placeholder image logic for demo purposes if URL is invalid/empty */}
          <NFTCard.Image
            src={item.image || `https://avatar.vercel.sh/${item.name}`}
            alt={item.name}
          />
          <NFTCard.Content>
            <NFTCard.Title>{item.name}</NFTCard.Title>
            {item.collectionName && (
              <NFTCard.Description>{item.collectionName}</NFTCard.Description>
            )}
          </NFTCard.Content>
        </NFTCard>
      ))}
    </div>
  );
}
