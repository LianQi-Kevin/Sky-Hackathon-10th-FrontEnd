import CryptoJS from "crypto-js";

// use crypto-js to generate MD5 hash of a file
export function getFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function (e) {
      if (e.target) {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result as ArrayBuffer);
        resolve(CryptoJS.MD5(wordArray).toString());
      } else {
        reject(new Error("File reading failed"));
      }
    };
    reader.onerror = function () {
      reject(new Error("File reading failed"));
    };
  });
}