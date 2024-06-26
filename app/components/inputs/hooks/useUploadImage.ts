import { ImageListType, ImageType } from "react-images-uploading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PreviewImageWithUrl } from "@/app/types";
import { uploadImage } from "@/app/services/uploadImage";

interface Props {
  value: PreviewImageWithUrl[];
  onChange: (value: PreviewImageWithUrl[]) => void;
}

export const useUploadImage = ({ value: images, onChange }: Props) => {
  const [previewImages, setPreviewImages] = useState(
    images.map((image) => {
      const { url, ...rest } = image;
      return { ...rest, dataURL: url as string } as ImageType;
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
        imageList.find((v) => v.dataURL === image.url)
      );
      onChange(remainingImages);
      setPreviewImages(
        remainingImages.map((image) => {
          const { url, ...rest } = image;
          return { ...rest, dataURL: url as string };
        })
      );
      return;
    }

    setIsUploading(true);

    // replace image
    if (images.length && addUpdateIndex[0] < images.length) {
      const newImages = [...images];
      const urlPromise = uploadImage({
        dataUrl: imageList[addUpdateIndex[0]].dataURL!,
        file: imageList[addUpdateIndex[0]].file!,
      });
      const originalImages = [...images];
      newImages[addUpdateIndex[0]] = {
        ...imageList[addUpdateIndex[0]],
        url: urlPromise,
      };
      onChange(newImages);

      urlPromise
        .then((url) => {
          setIsUploading(false);

          newImages[addUpdateIndex[0]].url = url;
          onChange([...newImages]);
          setPreviewImages(
            newImages.map((image) => {
              const { url, ...rest } = image;
              return { ...rest, dataURL: url as string };
            })
          );
        })
        .catch(() => {
          toast.error("Cannot upload image.");
          onChange(originalImages);
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
    const originalImages = [...images];
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
    onChange([...images, ...newImagesPromises]);

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
    onChange(finalImages);
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
