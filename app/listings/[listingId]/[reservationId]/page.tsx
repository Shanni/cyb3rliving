import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import ReservationClient from "./ReservationClient";

type Props = {
  params: {
    listingId: string;
    reservationId: string;
  };
};

const PaymentPage = async ({ params }: Props) => {
  const currentUser = await getCurrentUser();

  const listings = await getListings({ userId: currentUser?.id });
  const listing = listings.find((listing) => listing.id === params.listingId);
  const reservation = listing?.reservations.find(
    (reservation) => reservation.id === params.reservationId
  );

  return (
    <ReservationClient
      currentUser={currentUser}
      listing={currentUser ? listing : undefined}
      reservation={currentUser ? reservation : undefined}
    />
  );
};

export default PaymentPage;
