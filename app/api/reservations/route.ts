import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { differenceInDays } from "date-fns";

const addQuestions = async (
  questions: { question: string; answer: string }[],
  userId: string
) => {
  const oldSavedQuestions = await prisma.question.findMany({
    where: {
      userId: userId,
    },
  });
  const questionsToUpdate = questions.filter((newQuestion) => {
    return oldSavedQuestions.some((oldQuestion) => {
      return oldQuestion.question === newQuestion.question;
    });
  });
  const questionsToCreate = questions.filter((newQuestion) => {
    return !oldSavedQuestions.some((oldQuestion) => {
      return oldQuestion.question === newQuestion.question;
    });
  });
  if (questionsToCreate.length > 0) {
    await prisma.question.createMany({
      data: questionsToCreate.map((question) => {
        return {
          userId: userId,
          question: question.question,
          answer: question.answer,
        };
      }),
    });
  }
  await Promise.all([
    ...questionsToUpdate.map(async (question) => {
      await prisma.question.update({
        where: {
          questionIdentifier: {
            userId: userId,
            question: question.question,
          },
        },
        data: {
          answer: question.answer,
        },
      });
    }),
  ]);
};

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("You must be logged in to book a reservation", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const body = await request.json();
  const { listingId, start, end, questions } = body;

  if (!listingId || !start || !end) {
    return new Response("Missing required fields", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const conflistingReservations = await prisma.reservation.findMany({
    where: {
      AND: [
        {
          isApproved: true,
        },
        {
          OR: [
            {
              startDate: {
                gte: startDate,
                lt: endDate,
              },
            },
            {
              endDate: {
                gt: startDate,
                lte: endDate,
              },
            },
          ],
        },
      ],
    },
  });

  if (conflistingReservations.length > 0) {
    return new Response("Your dates are no longer available", {
      status: 409,
      statusText: "Conflict",
    });
  }

  const originalListing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    select: {
      price: true,
      user: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
          name: true,
        },
      },
    },
  });

  if (!originalListing) {
    return new Response("Listing not found", {
      status: 404,
      statusText: "Not Found",
    });
  }

  const listing = await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          startDate: startDate,
          endDate: endDate,
          totalPrice:
            originalListing.price * differenceInDays(endDate, startDate),
        },
      },
    },
    select: {
      id: true,
      reservations: {
        select: {
          id: true,
        },
      },
    },
  });

  if (questions) {
    addQuestions(questions, currentUser.id);
  }

  return NextResponse.json({
    listingId: listing.id,
    reservationId: listing.reservations[listing.reservations.length - 1].id,
  });
}
