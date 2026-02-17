/**
 * Utility functions for handling links in chat messages
 */

import React from 'react';

// Regular expression to detect URLs
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[^\s]{2,})/gi;

/**
 * Converts plain text URLs to clickable links
 * @param text - The text to process
 * @returns JSX elements with links rendered as clickable anchors
 */
export const renderTextWithLinks = (text: string) => {
  if (!text) return text;
  
  // Split text by URLs
  const parts = text.split(URL_REGEX);
  
  return parts.map((part, index) => {
    if (!part) return null;
    
    // Check if this part is a URL
    if (part.match(URL_REGEX)) {
      // Ensure URL has protocol
      let url = part;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.startsWith('www.')) {
          url = 'https://' + url;
        } else {
          url = 'https://' + url;
        }
      }
      
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      );
    }
    
    // Regular text part
    return <span key={index}>{part}</span>;
  });
};

/**
 * Checks if a string contains URLs
 * @param text - The text to check
 * @returns boolean indicating if URLs are present
 */
export const hasLinks = (text: string): boolean => {
  return URL_REGEX.test(text);
};