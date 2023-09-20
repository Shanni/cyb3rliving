import { arbitrum, mainnet, polygon } from "wagmi/chains";

const wagmiProjectId: string | undefined =
  process.env.WALLET_CONNECT_PROJECT_ID;
const chains = [arbitrum, mainnet, polygon];

export { wagmiProjectId, chains };
