'use client';

import React from 'react';

type RenderWithLinksProps = {
  text: string;
};

export const RenderWithLinks = ({ text }: RenderWithLinksProps) => {
  if (!text) return null;

  // Improved regex to match URLs with or without http(s):// and basic domain names
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  const parts = text.split(urlRegex).filter(Boolean);

  return (
    <p>
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          const href = part.startsWith('http') || part.startsWith('ftp') || part.startsWith('file') ? part : `https://` + part;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
};
