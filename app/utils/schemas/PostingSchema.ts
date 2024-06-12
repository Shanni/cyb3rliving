import { categoryNames } from "@/app/components/navbar/Categories";
import { z } from "zod";

const CategorySchema = z.object({
  category: z.enum(categoryNames),
});

const LocationSchema = z.object({
  location: z.object({
    address: z.string().min(1),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});

const RoomCountSchema = z.object({
  guestCount: z.number(),
  roomCount: z.number(),
  bathroomCount: z.number(),
});

const ImagesSchema = z.object({
  images: z.array(z.string()).length(1, "At least one photo is required"),
});

const TitleAndDescriptionSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
});

const PriceSchema = z.object({
  step: z.literal(5).optional(),
  price: z.number({ message: "Price is required" }),
});

export const PostingValidationSchema = [
  CategorySchema,
  LocationSchema,
  RoomCountSchema,
  ImagesSchema,
  TitleAndDescriptionSchema,
  PriceSchema,
];

export const postingSchema = CategorySchema.and(LocationSchema)
  .and(RoomCountSchema)
  .and(ImagesSchema)
  .and(TitleAndDescriptionSchema)
  .and(PriceSchema);

export type Posting = z.infer<typeof postingSchema>;
