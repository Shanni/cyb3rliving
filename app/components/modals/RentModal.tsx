"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, UseFormSetValue, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import useRentModal from "@/app/hooks/useRentModal";

import Modal from "./Modal";
import Counter from "../inputs/Counter";
import CategoryInput from "../inputs/CategoryInput";
import { categories } from "../navbar/Categories";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import Heading from "../Heading";
import LocationSearch from "../inputs/LocationSearch";
import { ErrorMessage } from "../inputs/hooks/ErrorMessage";
import {
  Posting,
  PostingValidationSchema,
} from "@/app/utils/schemas/PostingSchema";
import { FilePondFile } from "filepond";
import { uploadFile } from "@/app/services/uploadImage";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

const RentModal = () => {
  const rentModal = useRentModal();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);

  const currentValidationSchema = PostingValidationSchema[step];

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
    reset,
  } = useForm<Posting>({
    resolver: zodResolver(currentValidationSchema),
    defaultValues: {
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      images: [],
    },
  });

  const [filepondFiles, setFilepondFiles] = useState<FilePondFile[]>([]);

  const location = watch("location");
  const category = watch("category");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");

  const setCustomValue = (
    id: Parameters<UseFormSetValue<Posting>>[0],
    value: any
  ) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<Posting> = async () => {
    const data = getValues();
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    setIsLoading(true);

    const imageUrlPromises = data.images.map((id) => {
      const filepondFile = filepondFiles.find((file) => file.id === id);
      if (!filepondFile) {
        return null;
      }
      const url = uploadFile(filepondFile.file as File);
      return url;
    });

    const results = await Promise.allSettled(imageUrlPromises);

    const fulfilledResults = results.filter(
      (result) => result.status === "fulfilled"
    ) as PromiseFulfilledResult<string>[];

    data.images = fulfilledResults.map((r) => r.value);

    axios
      .post("/api/listings", data)
      .then(() => {
        toast.success("Listing created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModal.onClose();
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create";
    }

    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return "Back";
  }, [step]);

  let bodyContent = (
    <div key={STEPS.CATEGORY}>
      <Heading
        title="Which of these best describes your place?"
        subtitle="Pick a category"
      />
      <ErrorMessage message={errors.category?.message} />
      <div
        className="
          mt-2
          grid
          grid-cols-1
          md:grid-cols-2
          gap-3
          max-h-[50vh]
          overflow-y-auto
        "
      >
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue("category", category)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const [searchString, setSearchString] = useState("");

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div key={STEPS.LOCATION}>
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <ErrorMessage message={errors.location?.message} />
        <LocationSearch
          value={location}
          onChange={(value) => setCustomValue("location", value)}
          searchString={searchString}
          setSearchString={setSearchString}
        />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8" key={STEPS.INFO}>
        <Heading
          title="Share some basics about your place"
          subtitle="What amenitis do you have?"
        />
        <Counter
          onChange={(value) => setCustomValue("guestCount", value)}
          value={guestCount}
          title="Guests"
          subtitle="How many guests do you allow?"
        />
        <hr />
        <Counter
          onChange={(value) => setCustomValue("roomCount", value)}
          value={roomCount}
          title="Rooms"
          subtitle="How many rooms do you have?"
        />
        <hr />
        <Counter
          onChange={(value) => setCustomValue("bathroomCount", value)}
          value={bathroomCount}
          title="Bathrooms"
          subtitle="How many bathrooms do you have?"
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div key={STEPS.IMAGES}>
        <Heading
          title="Add a photo of your place"
          subtitle="Show guests what your place looks like!"
        />
        <ErrorMessage message={errors.images?.message} />
        <ImageUpload
          filepondFiles={filepondFiles}
          setFilepondFiles={setFilepondFiles}
          onChange={(value) => setCustomValue("images", value)}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div key={STEPS.DESCRIPTION}>
        <Heading
          title="How would you describe your place?"
          subtitle="Short and sweet works best!"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <ErrorMessage message={errors.title?.message} />
        <hr className="my-4" />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div key={STEPS.PRICE}>
        <Heading
          title="Now, set your price"
          subtitle="How much do you charge per night?"
        />
        <ErrorMessage message={errors.price?.message} />
        <Input
          id="price"
          label="Price"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={rentModal.isOpen}
      title="Airbnb your home!"
      actionLabel={actionLabel}
      isSubmitButton={true}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModal.onClose}
      body={bodyContent}
    />
  );
};

export default RentModal;
