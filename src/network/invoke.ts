import basic_axios from "@/network/basic";


export function invoke(prompt: string, file?: File) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  if (file) {
      formData.append("file", file);
  }

  return basic_axios.post("/invoke", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
