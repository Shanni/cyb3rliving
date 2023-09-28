"use client";

import Container from "@/app/components/Container";
import { createOrder } from "@/app/libs/paypal/createOrder";
import { onApproveOrder } from "@/app/libs/paypal/onApproveOrder";
import { usePaymentStore } from "@/app/stores/payment";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
  throw new Error("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
}

const paypalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
};

const PaymentPage = () => {
  const listing = usePaymentStore((store) => store.listing);
  const dateRange = usePaymentStore((store) => store.dateRange);
  console.log(listing, dateRange);
  const router = useRouter();

  useEffect(() => {
    if (!listing || !dateRange) {
      router.push("/");
    }
  }, [dateRange, listing, router]);

  const createPaypalOrder = async () => {
    return createOrder({
      id: listing!.id,
      dayCount: differenceInDays(dateRange.endDate!, dateRange.startDate!),
    });
  };

  const onApprovePaypalOrder = async (data: any) => {
    await onApproveOrder(data);
    // createReservation();
  };

  return (
    <Container>
      <h1>Successfully reserved {listing?.title}</h1>
      <h2>You have 20 minutes to make payment</h2>
      <PayPalScriptProvider options={paypalScriptOptions}>
        <PayPalButtons
          createOrder={createPaypalOrder}
          onApprove={onApprovePaypalOrder}
        />
      </PayPalScriptProvider>
    </Container>
  );
};

export default PaymentPage;
