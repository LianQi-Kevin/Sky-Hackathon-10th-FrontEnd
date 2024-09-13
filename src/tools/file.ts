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

/**
 * 格式化文件大小
 * @param size 文件大小，单位为字节 File.size
 * @returns 格式化后的文件大小，单位可能为B、KB、MB、GB或TB
 */
export function formatFileSize(size: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return size.toFixed(2) + ' ' + units[unitIndex];
}