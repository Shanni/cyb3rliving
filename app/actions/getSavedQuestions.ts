import prisma from "@/app/libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function getSavedQuestions() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const questions = await prisma.question.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        // id: true,
        question: true,
        answer: true,
      },
    });

    return questions;
  } catch (error: any) {
    throw new Error(error);
  }
}
