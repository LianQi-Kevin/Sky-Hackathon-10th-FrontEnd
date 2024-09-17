export interface InvokeResponse {
  status: "verifying" | "loading" | "extracting" | "retrieving" | "checking" | "summarizing" | "querying" | "success" | "field";
  message: string;
  result: string;
}
