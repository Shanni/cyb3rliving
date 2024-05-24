"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { differenceInDays, format } from "date-fns";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import HeartButton from "../HeartButton";
import Button from "../Button";
import { parseLocation } from "@/app/utils/scripts/parseLocation";
import { Carousel } from "react-responsive-carousel";
import { ListingCardCarouselButton } from "./ListingCardCarouselButton";

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
  const [isHover, setIsHover] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(0);

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
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
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
          <Carousel
            key={data.id}
            showStatus={false}
            showIndicators={false}
            renderArrowPrev={(onClickHandler, hasPrev, label) => (
              <ListingCardCarouselButton
                direction="prev"
                setViewingIndex={setViewingIndex}
                onClickHandler={onClickHandler}
                canScroll={hasPrev}
                label={label}
              />
            )}
            renderArrowNext={(onClickHandler, hasNext, label) => (
              <ListingCardCarouselButton
                direction="next"
                setViewingIndex={setViewingIndex}
                onClickHandler={onClickHandler}
                canScroll={hasNext}
                label={label}
              />
            )}
          >
            {data.images.map((image, index) => (
              <div key={image}>
                <Image
                  src={image}
                  width={350}
                  height={350}
                  className={`aspect-square object-cover transition ${
                    isHover && viewingIndex === index ? "scale-105" : ""
                  }`}
                  alt="Photo of the property"
                />
              </div>
            ))}
          </Carousel>
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
          <p className="font-semibold text-lg">{}</p>
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
