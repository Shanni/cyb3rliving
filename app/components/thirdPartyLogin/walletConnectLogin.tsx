import Button from "../Button";
import walletConnectSvg from "../custom_svg/walletConnectSvg";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function WalletConnectLogin() {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);
  const { open: web3modelOpen, close: web3modelClose } = useWeb3Modal();
  const { address, isConnecting, isDisconnected } = useAccount();

  const onWeb3Connect = () => {
    setIsLoading(true);

    signIn("web3wallet", {
      walletAddress: address,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        toast.success("Logged in");

        router.refresh();
        loginModal.onClose();
        registerModal.onClose();
        web3modelClose();
      }

      if (callback?.error) {
        toast.error(callback.error);
      }
    });
  };

  return (
    <Button
      outline
      label="Continue with WalletConnect"
      icon={walletConnectSvg}
      onClick={() => {
        web3modelOpen().then(() => {
          if (isConnecting) {
            toast.loading("Connecting to wallet");
          }

          if (isDisconnected) {
            toast.error("Disconnected from wallet");
          }

          if (address) {
            onWeb3Connect();
          }
        });
      }}
    />
  );
}
