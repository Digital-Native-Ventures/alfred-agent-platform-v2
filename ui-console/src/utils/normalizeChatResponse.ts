export interface NormalizedReply { 
  response: string;
}

/**
 * Normalizes chat API responses to a consistent format
 * Handles multiple response key formats and provides fallbacks
 */
export function normalizeChatResponse(
  data: unknown, 
  extraKeys: string[] = []
): NormalizedReply {
  // Handle plain string responses
  if (typeof data === "string") {
    return { response: data.trim() };
  }

  // Handle null/undefined data
  if (!data || typeof data !== 'object') {
    return { response: "" };
  }
  
  // Check standard keys first, then extra keys
  const allKeys = ['response', 'reply', 'message', 'content', ...extraKeys];
  
  for (const key of allKeys) {
    if ((data as Record<string, unknown>)[key] && typeof (data as Record<string, unknown>)[key] === 'string') {
      return { response: ((data as Record<string, unknown>)[key] as string).trim() };
    }
  }

  // Log unrecognized response structure (dev only)
  if (import.meta.env.MODE === 'development' && data && typeof data === 'object') {
    console.warn("Unrecognized API response keys:", Object.keys(data));
    console.log("Raw response payload:", data);
  }

  return { response: "" };
}