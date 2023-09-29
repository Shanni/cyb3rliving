"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { differenceInDays, format } from "date-fns";

import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import HeartButton from "../HeartButton";
import Button from "../Button";
import { parseLocation } from "@/app/utils/scripts/parseLocation";

interface ListingCardProps {
  data: SafeListing;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
}) => {
  const router = useRouter();

  const parsedLocation = parseLocation(data.locationValue);

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      onAction?.(actionId);
    },
    [disabled, onAction, actionId]
  );

  const shouldPayTotal = !reservation
    ? 0
    : differenceInDays(
        new Date(reservation.endDate),
        new Date(reservation.startDate)
      ) * reservation.listing.price;

  const reservationDate = useMemo(() => {
    if (!reservation) {
      return null;
    }

    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);

    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div
          className="
            aspect-square 
            w-full 
            relative 
            overflow-hidden
            rounded-md
          "
        >
          <Image
            fill
            className="
              object-cover 
              h-full 
              w-full 
              group-hover:scale-110 
              transition
            "
            src={data.images[0]}
            alt="Listing"
          />
          <div
            className="
            absolute
            top-3
            right-3
          "
          >
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>
        </div>
        <div>
          <p className="font-semibold text-lg">{data.title}</p>
          <p className="font-light">
            {parsedLocation.street}, {parsedLocation.city}
          </p>
        </div>
        <div className="font-light text-neutral-500">
          {reservationDate || data.category}
        </div>
        {reservation ? (
          reservation.hasPaid ? (
            <div className="font-semibold">$ {reservation.totalPrice}</div>
          ) : (
            <a
              href={`/listings/${reservation.listingId}/${reservation.id}/payment`}
              className="font-semibold text-primary-dark hover:underline"
            >
              Pay {shouldPayTotal}
            </a>
          )
        ) : (
          <div className="flex flex-row items-center gap-1">
            <div className="font-semibold">$ {data.price}</div>
            <div className="font-light">night</div>
          </div>
        )}
        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel}
            onClick={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ListingCard;
