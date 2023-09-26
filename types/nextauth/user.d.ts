import Nextauth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Custom fields
    walletAddress?: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}
