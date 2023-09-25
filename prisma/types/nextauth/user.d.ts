import Nextauth from "@/pages/api/auth/[...nextauth]";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string;
    email: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
    walletAddress?: string;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}
