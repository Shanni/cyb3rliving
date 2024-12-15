"use client";

import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Dispatch, SetStateAction } from "react";
import { FilePondFile } from "filepond";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

declare global {
  var cloudinary: any;
}

interface ImageUploadProps {
  filepondFiles: FilePondFile[];
  setFilepondFiles: Dispatch<SetStateAction<FilePondFile[]>>;
  onChange: (value: string[]) => void;
}

const MAX_IMAGE_NUMBER = 30;

const ImageUpload: React.FC<ImageUploadProps> = ({
  filepondFiles,
  setFilepondFiles,
  onChange,
}) => {
  return (
    <div className="w-full h-[60vh] md:h-[50vh] overflow-auto">
      <FilePond
        files={filepondFiles.map((f) => f.file)}
        styleItemPanelAspectRatio="0.75"
        allowReorder={true}
        allowMultiple={true}
        onupdatefiles={(files) => {
          setFilepondFiles(files);
          onChange(files.map((f) => f.id));
        }}
        onreorderfiles={(files) => {
          onChange(files.map((f) => f.id));
        }}
        maxFiles={MAX_IMAGE_NUMBER}
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />
    </div>
  );
};

export default ImageUpload;
