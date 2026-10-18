export type ShortFileProp = {
  originalFileName: string;
  fileSize: number;
};

export type PresignedUrlProp = ShortFileProp & {
  url: string;
  fileNameInBucket: string;
};

export type FileProps = ShortFileProp & {
  id: string;
  createdAt?: Date;
  isDeleting?: boolean;
};

export type FilesListProps = {
  files: FileProps[];
  fetchFiles: () => Promise<void>;
  setFiles: (
    files: FileProps[] | ((files: FileProps[]) => FileProps[]),
  ) => void;
  downloadUsingPresignedUrl: boolean;
};

export type LoadSpinnerProps = {
  size?: "small" | "medium" | "large";
};

export type UploadFilesFormUIProps = {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadToServer: (event: React.FormEvent<HTMLFormElement>) => void;
  maxFileSize: number;
  selectedFiles?: File[];
  onFilesSelected?: (files: FileList | null) => void;
  onRemoveFile?: (index: number) => void;
};

export type FileInDBProp = {
  fileNameInBucket: string;
  originalFileName: string;
  fileSize: number;
};