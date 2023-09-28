"use client";

import Calendar from "../inputs/Calendar";
import { differenceInDays } from "date-fns";
import { SafeListing, SafeUser } from "@/app/types";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Button from "../Button";
import axios from "axios";
import { useState } from "react";
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

const ListingReservation: React.FC<ListingReservationProps> = ({
  listing,
  disabledDates,
}) => {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  const dayCount =
    dateRange.endDate && dateRange.startDate
      ? differenceInDays(dateRange.endDate, dateRange.startDate)
      : 1;

  const totalPrice = dayCount * listing.price;

  const goToPayment = () => {
    if (dayCount < 1) {
      toast.error("You must select at least one night.");
      return;
    }
    axios
      .post("/api/reservations", {
        listingId: listing.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      .then((res) => {
        const { listingId, reservationId } = res.data;
        router.push(`/listings/${listingId}/${reservationId}/payment`);
      })
      .catch((err) => {
        toast.error(err.response.data);
      });
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
        <Button disabled={dayCount < 1} label="Reserve" onClick={goToPayment} />
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
