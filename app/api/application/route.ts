import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const sendEmail = async (
  email: string,
  landlordEmail: string,
  decision: "approved" | "rejected",
  comment: string,
  listingId: string,
  reservationId: string
) => {
  const resend = new Resend(process.env.RECEND_API_KEY);
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://flowairb.vercel.app";

  const url = `${baseUrl}/listings/${listingId}/${reservationId}/payment`;

  resend.emails.send({
    from: "Flowairb <onboarding@resend.dev>",
    to: "taosit099@gmail.com",
    subject: `Coliving Application ${decision.replace(
      decision[0],
      decision[0].toUpperCase()
    )}`,
    reply_to: landlordEmail,
    html: `<p>Comments from landlord:</p>
      <p>${comment}</p>
     <p> Click <a href="${url}">here</a> to make a payment.</p>`,
  });
};

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  const { reservationId, decision, comment } = await request.json();

  if (!currentUser) {
    return new Response("You must be logged in to book a reservation", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const reservation = await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: {
      status: decision.toUpperCase(),
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!reservation) {
    return new Response("Reservation not found", {
      status: 404,
      statusText: "Not Found",
    });
  }

  sendEmail(
    reservation.user.email!,
    currentUser.email!,
    decision,
    comment,
    reservation.listingId,
    reservation.id
  );

  return NextResponse.json(reservation);
}
