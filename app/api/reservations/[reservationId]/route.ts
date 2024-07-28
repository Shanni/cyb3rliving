import { NextResponse } from "next/server";
import { ethers } from "ethers";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}

/**
 * Starts a reservation and returns the reservation ID.
 * This indicates that we are in the checkout process.
 * 
 * @param {Request} request - The request object containing reservation details.
 * @returns {Promise<Response>} - The response object containing the reservation details.
 */
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("You must be logged in to create a reservation", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  // TODO: add validation for startDate and endDate
  // TODO: don't take in totalPrice from frontend, should be calculated on the backend
  const { listingId, startDate, endDate, totalPrice } = await request.json();

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return new Response("Missing required fields", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const reservation = await prisma.reservation.create({
    data: {
      listingId,
      userId: currentUser.id,
      startDate,
      endDate,
      totalPrice,
      hasPaid: false,
    },
  });

  return NextResponse.json(reservation);
}

/**
 * Called once the transaction has gone through to check the funds were sent.
 * 
 * @param {Request} request - The request object containing transaction details.
 * @param {Object} params - The parameters object containing reservationId.
 * @returns {Promise<Response>} - The response object containing the updated reservation details.
 */
export async function PUT(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  const { reservationId } = params;
  const { transactionHash } = await request.json();

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

  const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
  const txReceipt = await provider.getTransactionReceipt(transactionHash);

  if (!txReceipt) {
    return new Response("Transaction not found", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const tx = await provider.getTransaction(transactionHash);

  if (!tx || tx.to === null || tx.from === null || tx.value === null) {
    return new Response("Invalid transaction", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const amount = ethers.formatEther(tx.value);
  console.log(`${amount} eth was received to ${tx.to} from ${tx.from}`);

  const reservation = await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: {
      hasPaid: true,
      transactionHash: transactionHash,
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
