"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";

import { WagmiProvider } from "wagmi";
import { wagmiProjectId, wagmiProjectConfig } from "./wagmiConfig";

export default function Wagmi({ children }: { children: React.ReactNode }) {
  const projectId = wagmiProjectId;

  if (!projectId) {
    throw new Error("projectId is required");
  }

  createWeb3Modal({
    wagmiConfig: wagmiProjectConfig,
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    enableOnramp: true, // Optional - false as default
  });

  // const { publicClient } = configureChains(chains, [
  //   w3mProvider({ projectId }),
  // ]);

  // const wagmiConfig = createConfig({
  //   autoConnect: true,
  //   connectors: w3mConnectors({ projectId, chains }),
  //   publicClient,
  // });

  // const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return <WagmiProvider config={wagmiProjectConfig}>{children}</WagmiProvider>;
}
