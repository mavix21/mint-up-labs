import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    ssr: true,
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
