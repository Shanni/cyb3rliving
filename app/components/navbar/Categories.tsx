"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { TbBeach, TbMountain, TbPool } from "react-icons/tb";
import { GiForestCamp, GiWindmill } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";
import { MdOutlineVilla } from "react-icons/md";

import CategoryBox from "../CategoryBox";
import Container from "../Container";
import { TuplifyUnion } from "@/app/types";

export const categories = [
  {
    label: "Hacker House",
    icon: TbBeach,
    description: "This property is hackerhouse!",
  },
  {
    label: "Party House",
    icon: GiWindmill,
    description: "This property is has windmills!",
  },
  {
    label: "Female Only",
    icon: MdOutlineVilla,
    description: "This property is modern!",
  },
  {
    label: "4 Seas",
    icon: TbMountain,
    description: "This property is in the countryside!",
  },
  {
    label: "Night Owl",
    icon: GiForestCamp,
    description: "This property offers camping activities!",
  },
  {
    label: "High End",
    icon: IoDiamond,
    description: "This property is brand new and luxurious!",
  },
  {
    label: "7AM Club",
    icon: IoDiamond,
    description: "This property is brand new",
  },
  {
    label: "Chinese Speaking",
    icon: IoDiamond,
    description: "This property is brand new",
  },
  {
    label: "Crazy Artist",
    icon: GiWindmill,
    description: "This property is has windmills!",
  },
] as const;

type Categories = typeof categories;

export type Category = Categories[number]["label"];

export const categoryNames = categories.map(
  (category) => category.label
) as TuplifyUnion<Category>;

const Categories = () => {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  if (!isMainPage) {
    return null;
  }

  return (
    <Container>
      <div
        className="
          pt-4
          flex 
          flex-row 
          items-center 
          justify-between
          overflow-x-auto
        "
      >
        {categories.map((item) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
            selected={category === item.label}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
