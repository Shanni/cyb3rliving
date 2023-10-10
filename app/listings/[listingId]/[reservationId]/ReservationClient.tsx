"use client";

import getListings from "@/app/actions/getListings";
import Button from "@/app/components/Button";
import ListingCard from "@/app/components/listings/ListingCard";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeUser } from "@/app/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  currentUser: SafeUser | null;
  listing: Awaited<ReturnType<typeof getListings>>[number] | undefined;
  reservation:
    | Awaited<ReturnType<typeof getListings>>[number]["reservations"][number]
    | undefined;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type Decision = "" | "approved" | "rejected";

const ReservationClient = ({ currentUser, listing, reservation }: Props) => {
  console.log({ listing, reservation });
  const [formData, setFormData] = useState({
    decision: "" as Decision,
    comment: "",
  });
  const loginModal = useLoginModal();

  useEffect(() => {
    if (!currentUser) {
      loginModal.onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (!listing || !reservation) {
    return <div>You do not have the permission to view this page</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .put("/api/application", {
        reservationId: reservation.id,
        ...formData,
      })
      .then(() => {
        toast.success(
          `Successfully ${formData.decision} the application. The applicant will be notified`
        );
      })
      .catch((err) => {
        toast.error(err?.message || "Something went wrong");
      });
  };

  return (
    <div>
      <div className="max-w-sm">
        <ListingCard
          currentUser={currentUser}
          key={listing.id}
          data={listing}
        />
      </div>
      <p>
        {reservation.user.name} wants to join coliving from{" "}
        {formatDate(reservation.startDate)} to {formatDate(reservation.endDate)}
      </p>
      <p>Total price: {reservation.totalPrice}</p>
      {reservation.questions && (
        <div>
          <p>Here are the applicant&apos;s answers</p>
          <div>
            {(
              reservation.questions as { question: string; answer: string }[]
            ).map((question) => (
              <div key={question.question}>
                <p>{question.question}</p>
                <p>{question.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <p>Do you approve this application?</p>
          <input
            type="radio"
            name="action"
            value="approved"
            checked={formData.decision === "approved"}
            onChange={(e) =>
              setFormData({ ...formData, decision: e.target.value as Decision })
            }
          />
          <label>Approve</label>
          <input
            type="radio"
            name="action"
            value="rejected"
            checked={formData.decision === "rejected"}
            onChange={(e) =>
              setFormData({ ...formData, decision: e.target.value as Decision })
            }
          />
          <label>Reject</label>
        </div>
        <div>
          <label htmlFor="comment">Leave a comment to the applicant</label>
          <textarea
            className="block"
            id="comment"
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
          />
        </div>
        <Button label="Submit" disabled={!formData.decision} />
      </form>
    </div>
  );
};

export default ReservationClient;
