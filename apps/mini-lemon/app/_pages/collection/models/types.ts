export interface NFT {
  id: string;
  name: string;
  image: string;
  collectionName?: string;
}

export interface WalletData {
  address: string;
  balanceUSDC: number;
}
