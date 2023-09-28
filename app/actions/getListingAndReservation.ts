import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId: string;
  reservationId: string;
}

export default async function getListingAndReservation(params: IParams) {
  try {
    const { listingId, reservationId } = params;

    if (!listingId || !reservationId) {
      throw new Error("Missing required fields");
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    if (!listing || !reservation) {
      throw new Error("Listing or reservation not found");
    }

    return {
      listing,
      reservation,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
