"use client";

import getListingAndReservation from "@/app/actions/getListingAndReservation";
import Container from "@/app/components/Container";
import { createOrder } from "@/app/libs/paypal/createOrder";
import { onApproveOrder } from "@/app/libs/paypal/onApproveOrder";
import { SafeUser } from "@/app/types";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";

type Props = Awaited<ReturnType<typeof getListingAndReservation>> & {
  currentUser?: SafeUser | null;
};

if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
  throw new Error("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
}

const paypalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
};

const PaymentClient = ({ listing, reservation, currentUser }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || currentUser.id !== reservation.userId) {
      router.push(`/listings/${listing.id}`);
    }
  }, [currentUser, listing.id, reservation.userId, router]);

  const confirmReservation = async () => {
    const res = await axios.put(`/api/reservations/${reservation.id}`, {
      totalPrice:
        listing.price *
        differenceInDays(reservation.endDate, reservation.startDate),
    });
    if (res.status === 200) {
      router.push(`/trips`);
    } else {
      toast.error("Something went wrong");
    }
  };

  const createPaypalOrder = async () => {
    return createOrder({
      id: listing.id,
      dayCount: differenceInDays(reservation.endDate, reservation.startDate),
    });
  };

  const onApprovePaypalOrder = async (data: any) => {
    await onApproveOrder(data);
    await confirmReservation();
  };

  return (
    <Container>
      <h1>Successfully reserved {listing.title}</h1>
      <h2>You have 20 minutes to make a payment</h2>
      <PayPalScriptProvider options={paypalScriptOptions}>
        <PayPalButtons
          createOrder={createPaypalOrder}
          onApprove={onApprovePaypalOrder}
        />
      </PayPalScriptProvider>
    </Container>
  );
};

export default PaymentClient;
