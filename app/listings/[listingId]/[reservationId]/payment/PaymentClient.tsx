"use client";

import getListingAndReservation from "@/app/actions/getListingAndReservation";
import Container from "@/app/components/Container";
import { createOrder } from "@/app/libs/paypal/createOrder";
import { onApproveOrder } from "@/app/libs/paypal/onApproveOrder";
import { SafeUser } from "@/app/types";
import { GRACE_PERIOD } from "@/app/utils/constants";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

type Props = Awaited<ReturnType<typeof getListingAndReservation>> & {
  currentUser?: SafeUser | null;
};

if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
  throw new Error("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
}

const paypalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: "CAD",
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const PaymentClient = ({ listing, reservation, currentUser }: Props) => {
  const router = useRouter();
  const [countDownInSeconds, setCountDownInSeconds] = useState(
    GRACE_PERIOD / 1000
  );

  useEffect(() => {
    if (!currentUser || currentUser.id !== reservation.userId) {
      router.push(`/listings/${listing.id}`);
      return;
    }
    if (reservation.hasPaid) {
      router.push(`/trips`);
      return;
    }
    const remainingSeconds = Math.round(
      (reservation.createdAt.getTime() + GRACE_PERIOD - new Date().getTime()) /
        1000
    );
    if (remainingSeconds <= 0) {
      router.push(`/listings/${listing.id}`);
      return;
    }
    setCountDownInSeconds(remainingSeconds);
    const interval = setInterval(() => {
      setCountDownInSeconds((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    currentUser,
    listing.id,
    reservation.createdAt,
    reservation.hasPaid,
    reservation.userId,
    router,
  ]);

  const formattedCountDown = useMemo(() => {
    const minutes = Math.floor(countDownInSeconds / 60);
    const seconds = countDownInSeconds % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }, [countDownInSeconds]);

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
      <h1
        className="
      text-primary-dark text-2xl
      "
      >
        Successfully reserved{" "}
        <span className="text-slate-700 font-bold">{listing.title}</span>
      </h1>
      <p>
        {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
      </p>
      <p>
        Pay{" "}
        {listing.price *
          differenceInDays(reservation.endDate, reservation.startDate)}
      </p>
      <h2>You have {formattedCountDown} to make a payment</h2>
      <div className="mt-8">
        <PayPalScriptProvider options={paypalScriptOptions}>
          <PayPalButtons
            createOrder={createPaypalOrder}
            onApprove={onApprovePaypalOrder}
          />
        </PayPalScriptProvider>
      </div>
    </Container>
  );
};

export default PaymentClient;
