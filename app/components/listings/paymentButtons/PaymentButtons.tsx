"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import React from "react";

type Props = {
  createOrder: () => Promise<string>;
  onApprove: (data: any) => Promise<void>;
};

const PaymentButtons = ({ createOrder, onApprove }: Props) => {
  return <PayPalButtons createOrder={createOrder} onApprove={onApprove} />;
};

export default PaymentButtons;
