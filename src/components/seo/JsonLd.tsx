import React from "react";

interface JsonLdProps {
  schema: Record<string, any>;
}

/**
 * Reusable JSON-LD Structured Data Script component.
 * Prevents dangerous inner HTML boilerplate repeating across the codebase.
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
