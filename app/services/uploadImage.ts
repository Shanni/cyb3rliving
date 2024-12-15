import axios from "axios";
import Compressor from "compressorjs";

const compressImage = (file: File | Blob) => {
  return new Promise<File | Blob>((resolve, reject) => {
    new Compressor(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      success: (compressedFile) => {
        resolve(compressedFile);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const uploadFile = async (file: File) => {
  const compressedFile = file.size > 1000000 ? await compressImage(file) : file;

  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);
  });

  const response = await axios.post("/api/images", {
    imageData: dataUrl,
  });
  return response.data.url as string;
};
