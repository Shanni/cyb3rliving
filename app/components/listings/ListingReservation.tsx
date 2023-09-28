"use client";

import Calendar from "../inputs/Calendar";
import { createOrder } from "@/app/libs/paypal/createOrder";
import { useState } from "react";
import axios from "axios";
import { differenceInDays } from "date-fns";
import { SafeListing, SafeUser } from "@/app/types";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { onApproveOrder } from "@/app/libs/paypal/onApproveOrder";
import PaymentButtons from "./paymentButtons/PaymentButtons";
import { Range } from "react-date-range";

interface ListingReservationProps {
  listing: SafeListing & {
    user: SafeUser;
  };
  disabledDates: Date[];
}

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

const getInitialDateRange = () => {
  return initialDateRange;
};

const ListingReservation: React.FC<ListingReservationProps> = ({
  listing,
  disabledDates,
}) => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<Range>(getInitialDateRange);

  const dayCount =
    dateRange.endDate && dateRange.startDate
      ? differenceInDays(dateRange.endDate, dateRange.startDate) || 1
      : 1;

  const totalPrice = dayCount * listing.price;

  const createReservation = () => {
    axios
      .post("/api/reservations", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
      })
      .then(() => {
        toast.success("Listing reserved!");
        setDateRange(initialDateRange);
        router.push("/trips");
      })
      .catch(() => {
        toast.error("Something went wrong.");
      });
  };

  const createPaypalOrder = async () => {
    console.log("dayCount", dayCount);
    return createOrder({
      id: listing.id,
      dayCount,
    });
  };

  const onApprovePaypalOrder = async (data: any) => {
    await onApproveOrder(data);
    createReservation();
  };

  return (
    <div
      className="
        bg-primary-light 
        border-[1px]
        overflow-hidden
      "
    >
      <div
        className="
      flex flex-row items-center gap-1 p-4"
      >
        <div className="text-2xl font-semibold">$ {listing.price}</div>
        <div className="font-light text-neutral-600">night</div>
      </div>
      <hr />
      <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={(value) => setDateRange(value.selection)}
      />
      <hr />
      <div className="p-4">
        <PaymentButtons
          createOrder={createPaypalOrder}
          onApprove={onApprovePaypalOrder}
        />
      </div>
      <hr />
      <div
        className="
          p-4 
          flex 
          flex-row 
          items-center 
          justify-between
          font-semibold
          text-lg
        "
      >
        <div>Total</div>
        <div>$ {totalPrice}</div>
      </div>
    </div>
  );
};

export default ListingReservation;
