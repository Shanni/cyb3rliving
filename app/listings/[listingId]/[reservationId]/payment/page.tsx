import getListingAndReservation from "@/app/actions/getListingAndReservation";
import EmptyState from "@/app/components/EmptyState";
import PaymentClient from "./PaymentClient";
import getCurrentUser from "@/app/actions/getCurrentUser";

type Props = {
  params: {
    listingId: string;
    reservationId: string;
  };
};

const PaymentPage = async ({ params }: Props) => {
  const listingAndReservation = await getListingAndReservation(params);
  const currentUser = await getCurrentUser();

  if (!listingAndReservation) {
    return <EmptyState />;
  }

  return <PaymentClient {...listingAndReservation} currentUser={currentUser} />;
};

export default PaymentPage;
