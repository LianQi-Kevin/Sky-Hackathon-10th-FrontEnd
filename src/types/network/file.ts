export interface FileUploadResponse {
  embedded_status: "pending" | "embedding" | "embedded";
  md5_code: string;
  file_suffix?: string;
  upload_time?: number;
}

export interface FileUploadDBResponse extends FileUploadResponse {
  id: string;
}

export interface FileEmbeddedResponse {
  status: "verified" | "success" | "embedding" | "field";
  data?: FileUploadResponse;
  message: string;
}