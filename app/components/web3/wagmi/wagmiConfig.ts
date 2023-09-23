import { arbitrum, mainnet, polygon } from "wagmi/chains";

const wagmiProjectId: string | undefined =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const chains = [arbitrum, mainnet, polygon];

export { wagmiProjectId, chains };
