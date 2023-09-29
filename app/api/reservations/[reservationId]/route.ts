import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}

export async function PUT(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  const { reservationId } = params;
  const { totalPrice } = await request.json();

  if (!currentUser) {
    return new Response("You must be logged in to book a reservation", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  if (!reservationId) {
    return new Response("Cannot find reservation", {
      status: 400,
      statusText: "Unauthorized",
    });
  }

  const reservation = await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: {
      totalPrice: totalPrice,
      hasPaid: true,
    },
  });

  return NextResponse.json(reservation);
}

export async function DELETE(_: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { reservationId } = params;

  if (!reservationId) {
    return new Response("No id provided", {
      status: 400,
    });
  }

  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId,
    },
    select: {
      id: true,
      userId: true,
      hasPaid: true,
      listing: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!reservation) {
    return new Response("No reservation found with the given id", {
      status: 400,
    });
  }

  if (
    reservation.userId !== currentUser.id &&
    reservation.listing.userId !== currentUser.id
  ) {
    return new Response("You are not authorized to delete this reservation", {
      status: 403,
    });
  }

  if (!reservation.hasPaid) {
    await prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });
  } else {
    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        isCancelled: true,
      },
    });
  }

  return NextResponse.json(reservation);
}
