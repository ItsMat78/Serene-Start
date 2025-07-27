import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Link = {
  title: string;
  href: string;
};

const urlRegex = /((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|([A-Z0-9.-]+\.[A-Z]{2,})/gi;

// Improved link extractor
export const extractLinks = (text: string): Link[] => {
  if (!text) return [];
  const matches = text.match(urlRegex);

  if (!matches) {
    return [];
  }

  const links: Link[] = matches.map(rawUrl => {
    let href = rawUrl;
    if (!/^(https?|ftp|file):\/\//.test(href)) {
      href = `https://${href}`;
    }
    return { title: rawUrl, href };
  });

  return links;
};

export const removeLinks = (text: string): string => {
  if (!text) return "";
  // The stateful nature of the global regex requires a reset before each use.
  urlRegex.lastIndex = 0;
  return text.replace(urlRegex, '').trim();
};
