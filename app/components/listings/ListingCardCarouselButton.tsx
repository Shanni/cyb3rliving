import React from "react";

type Props = {
  setViewingIndex: React.Dispatch<React.SetStateAction<number>>;
  direction: "prev" | "next";
  onClickHandler: () => void;
  canScroll: boolean;
  label: string;
};

export const ListingCardCarouselButton = ({
  setViewingIndex,
  direction,
  onClickHandler,
  canScroll,
  label,
}: Props) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setViewingIndex((prev) => (direction === "prev" ? prev - 1 : prev + 1));
        onClickHandler();
      }}
      title={label}
      style={{ [direction === "prev" ? "left" : "right"]: 4 }}
      className={`absolute top-1/2 transform -translate-y-1/2 z-2 p-2 ${
        !canScroll ? "hidden" : ""
      }`}
    >
      {/* {direction === "prev" ? "Prev" : "Next"} */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={`listing-card-chevron ${
          direction === "prev" ? "rotate-180" : ""
        } opacity-80 hover:opacity-100 duration-500 hover:scale-105 transform transition-transform`}
      >
        <path
          d="M-5.96046e-07 9.99995C-5.96046e-07 15.5228 4.47715 19.9999 10 19.9999C15.5228 19.9999 20 15.5228 20 9.99995C20 4.4771 15.5228 -5.25749e-05 10 -5.25749e-05C4.47715 -5.25749e-05 -5.96046e-07 4.4771 -5.96046e-07 9.99995Z"
          fill="#ffffff80"
        />
        <path
          d="M9.09093 14.1208L12.7273 10.2499L9.09093 6.37891"
          stroke="#727272"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  );
};
