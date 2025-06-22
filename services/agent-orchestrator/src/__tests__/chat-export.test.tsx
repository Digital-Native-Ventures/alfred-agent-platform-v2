import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatPane } from "../features/chat/ChatPane";
import { useToast } from "@/hooks/use-toast";

// Mock the useToast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

// Mock URL.createObjectURL and related APIs
global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
global.URL.revokeObjectURL = vi.fn();

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast function
const mockToast = vi.fn();

describe("ChatPane Export Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    // Mock environment variable
    vi.stubEnv("VITE_ARCHITECT_URL", "http://localhost:8083");
  });

  it("should render chat pane with export button", () => {
    render(<ChatPane />);
    
    // Check if the chat header is rendered
    expect(screen.getByText("Architect Chat")).toBeInTheDocument();
    
    // Check if export button is present (though it may be hidden by CSS)
    const exportButton = screen.getByLabelText("Export chat as Markdown");
    expect(exportButton).toBeInTheDocument();
  });

  it("should call API and download file when export button is clicked", async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("# Architect Chat Export\\n\\n## Assistant\\n\\nHello! I'm the Architect AI."),
    });

    // Mock document.createElement and click
    const mockAnchor = {
      click: vi.fn(),
      href: "",
      download: "",
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);

    render(<ChatPane />);
    
    // Find and click the export button
    const exportButton = screen.getByLabelText("Export chat as Markdown");
    fireEvent.click(exportButton);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8083/architect/export",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("thread_id"),
        })
      );
    });

    // Check that blob and download were triggered
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    // Check that success toast was shown
    expect(mockToast).toHaveBeenCalledWith({
      title: "Chat exported ✨",
      description: "Your chat has been downloaded as a Markdown file",
    });
  });

  it("should show error toast when export fails", async () => {
    // Mock failed API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ChatPane />);
    
    const exportButton = screen.getByLabelText("Export chat as Markdown");
    fireEvent.click(exportButton);

    // Wait for the error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Export failed",
        description: "Error: HTTP 500",
        variant: "destructive",
      });
    });
  });

  it("should handle network errors gracefully", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ChatPane />);
    
    const exportButton = screen.getByLabelText("Export chat as Markdown");
    fireEvent.click(exportButton);

    // Wait for the error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Export failed",
        description: "Error: Network error",
        variant: "destructive",
      });
    });
  });

  it("should include messages in export payload", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("# Chat Export"),
    });

    render(<ChatPane />);
    
    const exportButton = screen.getByLabelText("Export chat as Markdown");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8083/architect/export",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("Hello! I'm the Architect AI"),
        })
      );
    });
  });

  it("should send message using streaming API", async () => {
    // Mock the streaming response
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"content": "Hello"}\n\n')
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"content": " there!"}\n\n')
        })
        .mockResolvedValueOnce({
          done: true,
          value: undefined
        })
    };

    const mockBody = {
      getReader: vi.fn().mockReturnValue(mockReader)
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: mockBody,
    });

    render(<ChatPane />);
    
    // Type a message and send it
    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });
    
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    // Wait for the API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8083/architect/complete",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("Test message"),
        })
      );
    });

    // Wait for the streaming response to be processed
    await waitFor(() => {
      expect(screen.getByText("Hello there!")).toBeInTheDocument();
    });
  });

  it("should handle streaming API errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<ChatPane />);
    
    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });
    
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error sending message",
        description: "Error: Network error",
        variant: "destructive",
      });
    });
  });
});