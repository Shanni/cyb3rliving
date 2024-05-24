import { arbitrum, mainnet, polygon } from "wagmi/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

const wagmiProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;
const chains = [arbitrum, mainnet, polygon] as const;

const wagmiProjectConfig = defaultWagmiConfig({
  chains,
  projectId: wagmiProjectId,
  metadata: {
    name: "Flowairb",
    description: "A Web3 Rental Platform",
    url: "https://flowairb.com",
    icons: [],
  },
});

export { wagmiProjectId, chains, wagmiProjectConfig };
