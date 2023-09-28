import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("You must be logged in to book a reservation", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const body = await request.json();
  console.log("post reservations:", body);
  const { listingId, startDate, endDate } = body;

  if (!listingId || !startDate || !endDate) {
    return new Response("Missing required fields", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const conflistingReservations = await prisma.reservation.findMany({
    where: {
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
  });

  if (conflistingReservations.length > 0) {
    return new Response("Your dates are no longer available", {
      status: 409,
      statusText: "Conflict",
    });
  }

  const listingAndReservation = await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          startDate,
          endDate,
        },
      },
    },
  });

  return NextResponse.json(listingAndReservation);
}
