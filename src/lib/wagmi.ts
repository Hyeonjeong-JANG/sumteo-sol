import { http, createConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo";

export const config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
