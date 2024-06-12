import { ImageListType, ImageType } from "react-images-uploading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PreviewImageWithUrl } from "@/app/types";
import { uploadImage } from "@/app/services/uploadImage";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export const useUploadImage = ({ value: images, onChange }: Props) => {
  const [previewImages, setPreviewImages] = useState(
    images.map((image) => {
      return { dataURL: image } as ImageType;
    })
  );

  const [isUploading, setIsUploading] = useState(false);

  const onImageFileChange = async (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    setPreviewImages(imageList);

    // delete image
    if (addUpdateIndex === undefined) {
      const remainingImages = images.filter((image) =>
        imageList.find((v) => v.dataURL === image)
      );
      onChange(remainingImages);
      setPreviewImages(
        remainingImages.map((image) => {
          return { dataURL: image };
        })
      );
      return;
    }

    setIsUploading(true);

    // replace image
    if (images.length && addUpdateIndex[0] < images.length) {
      const newImages = [...previewImages];
      const urlPromise = uploadImage({
        dataUrl: imageList[addUpdateIndex[0]].dataURL!,
        file: imageList[addUpdateIndex[0]].file!,
      });
      const originalImages = [...previewImages];
      newImages[addUpdateIndex[0]] = {
        ...imageList[addUpdateIndex[0]],
        url: urlPromise,
      };

      urlPromise
        .then((url) => {
          setIsUploading(false);

          newImages[addUpdateIndex[0]].url = url;
          onChange(newImages.map((img) => img.url));
          setPreviewImages(
            newImages.map((image) => {
              const { url, ...rest } = image;
              return { ...rest, dataURL: url as string };
            })
          );
        })
        .catch(() => {
          toast.error("Cannot upload image.");
          onChange(originalImages.map((img) => img.url));
          setPreviewImages(
            originalImages.map((image) => {
              const { url, ...rest } = image;
              return rest;
            })
          );
        });
      return;
    }

    // add images
    const originalImages = [...previewImages];
    const newImagesPromises = addUpdateIndex.map((index) => {
      const image = imageList[index];
      return {
        ...image,
        url: uploadImage({
          dataUrl: image.dataURL!,
          file: image.file!,
        }),
      };
    });
    // onChange([...images, ...newImagesPromises]);

    const uploadResults = await Promise.allSettled(
      newImagesPromises.map((image) => image.url)
    );
    const successfulUploads = uploadResults.filter(
      (result) => result.status === "fulfilled"
    ) as PromiseFulfilledResult<string>[];
    const successfulUploadsImages = newImagesPromises
      .filter((_image, index) => {
        return uploadResults[index].status === "fulfilled";
      })
      .map((image, index) => {
        return {
          ...image,
          url: successfulUploads[index].value,
        };
      });
    const finalImages = [...originalImages, ...successfulUploadsImages];
    onChange(finalImages.map((img) => img.url));
    setPreviewImages(
      finalImages.map((image) => {
        const { url, ...rest } = image;
        return { ...rest, dataURL: url as string };
      })
    );
    setIsUploading(false);

    if (successfulUploads.length !== newImagesPromises.length) {
      toast.error("Cannot upload all images.");
      setPreviewImages(
        finalImages.map((image) => {
          const { url, ...rest } = image;
          return rest;
        })
      );
    }
  };

  return {
    previewImages,
    isUploading,
    onImageFileChange,
  };
};
