import { describe, it, expect } from 'vitest';
import { normalizeChatResponse } from './normalizeChatResponse';

describe('normalizeChatResponse', () => {
  it.each([
    [{ response: "hello world" }, "hello world"],
    [{ reply: "hello world" }, "hello world"], 
    [{ message: "hello world" }, "hello world"],
    [{ content: "hello world" }, "hello world"],
    ["hello world", "hello world"],
    [{ response: "  trimmed  " }, "trimmed"],
    [{ reply: "  trimmed  " }, "trimmed"],
  ])('normalizes %p to response: "%s"', (input, expected) => {
    expect(normalizeChatResponse(input).response).toBe(expected);
  });

  it('handles empty and null responses', () => {
    expect(normalizeChatResponse({})).toEqual({ response: "" });
    expect(normalizeChatResponse(null)).toEqual({ response: "" });
    expect(normalizeChatResponse(undefined)).toEqual({ response: "" });
  });

  it('handles extra keys', () => {
    const data = { customKey: "custom response" };
    expect(normalizeChatResponse(data, ['customKey'])).toEqual({ 
      response: "custom response" 
    });
  });

  it('prioritizes standard keys over extra keys', () => {
    const data = { response: "standard", customKey: "custom" };
    expect(normalizeChatResponse(data, ['customKey'])).toEqual({ 
      response: "standard" 
    });
  });

  it('handles whitespace-only responses', () => {
    expect(normalizeChatResponse({ response: "   " })).toEqual({ response: "" });
    expect(normalizeChatResponse("   ")).toEqual({ response: "" });
  });
});