import { mockNFTs, mockWallet } from "./models/mock-data";
import { ActionButtons } from "./ui/action-buttons";
import { NFTGrid } from "./ui/nft-grid";
import { WalletHeader } from "./ui/wallet-header";

export default function CollectionPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col gap-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <WalletHeader balance={mockWallet.balanceUSDC} />
          {/* Settings icon could go here if needed, matching the design */}
        </div>

        <ActionButtons />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-4">
        <div className="border-border flex items-center gap-4 border-b pb-2">
          <h2 className="text-foreground border-primary -mb-2.5 border-b-2 px-1 pb-2 text-lg font-semibold">
            NFTs
          </h2>
          <h2 className="text-muted-foreground px-1 text-lg font-medium">
            Tokens
          </h2>
          <h2 className="text-muted-foreground px-1 text-lg font-medium">
            Activity
          </h2>
        </div>

        <NFTGrid items={mockNFTs} />
      </div>
    </div>
  );
}
