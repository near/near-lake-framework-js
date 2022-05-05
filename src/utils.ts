import { Readable } from "stream";
import { Block } from "./types";

export const sleep = (pause: number) =>
  new Promise((resolve) => setTimeout(resolve, pause));

// In the S3 bucket we store blocks height with prepended zeroes
// because these are string there and to avoid getting earlier
// blocks after later ones because of sorting strings issues
// we decided to prepend zeroes.
// This function normalizes the block height number into the string
export function normalizeBlockHeight(number: number) {
  return number.toString().padStart(12, "0");
}

export async function parseBody<T>(stream: Readable): Promise<T> {
  const contents = await streamToString(stream);
  const parsed: T = JSON.parse(contents, (key, value) => renameUnderscoreFieldsToCamelCase(value));
  return parsed;
}

// the function got from
// https://github.com/aws/aws-sdk-js-v3/issues/1877#issuecomment-755387549
function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

// function renames all fields in the nested object
// from underscore_style to camelCase
function renameUnderscoreFieldsToCamelCase(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    // It's a non-null, non-array object, create a replacement with the keys initially-capped
    const newValue = {};
    for (const key in value) {
      const newKey = key
        .split("_")
        .map((word, i) => {
          if (i > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          return word;
        })
        .join("");
      newValue[newKey] = value[key];
    }
    return newValue;
  }
  return value;
}
