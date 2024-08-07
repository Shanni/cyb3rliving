
import { Nunito } from "next/font/google";

import Navbar from "@/app/components/navbar/Navbar";
import LoginModal from "@/app/components/modals/LoginModal";
import RegisterModal from "@/app/components/modals/RegisterModal";
import SearchModal from "@/app/components/modals/SearchModal";
import RentModal from "@/app/components/modals/RentModal";

import ToasterProvider from "@/app/providers/ToasterProvider";

import "./globals.css";
import ClientOnly from "./components/ClientOnly";
import getCurrentUser from "./actions/getCurrentUser";

import Wagmi from "./components/web3/wagmi";

export const metadata = {
  title: "Cyb3rliving",
  description: "A Web3 Rental Platform for Digital Nomads",
};

const font = Nunito({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  let user: any;

  return (
    <html lang="en">
      <body className={`bg-primary-light ${font.className}`}>
        <Wagmi>
          <ClientOnly>
            <ToasterProvider />
            <LoginModal />
            <RegisterModal />
            <SearchModal />
            <RentModal />
            <Navbar currentUser={currentUser} user={user} />
          </ClientOnly>
          <div className="pb-20 pt-28">{children}</div>
        </Wagmi>
      </body>
    </html>
  );
}
