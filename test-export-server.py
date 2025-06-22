#!/usr/bin/env python3
"""
Simple test server for chat export functionality.
Run with: python3 test-export-server.py
"""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse


class ChatExportHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/healthz":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/architect/export":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)

            try:
                raw_data = post_data.decode("utf-8")
                print(f"Received data: {raw_data}")  # Debug
                data = json.loads(raw_data)
                messages = data.get("messages", [])
                thread_id = data.get("thread_id", "unknown")

                # Generate markdown export
                markdown = self._messages_to_markdown(messages, thread_id)

                self.send_response(200)
                self.send_header("Content-Type", "text/markdown")
                self.send_header(
                    "Content-Disposition", f'attachment; filename="chat-{thread_id}.md"'
                )
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(markdown.encode("utf-8"))

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "text/plain")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(f"Error: {str(e)}".encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def _messages_to_markdown(self, messages, thread_id):
        md = f"# Architect Chat Export\n\nThread ID: {thread_id}\n\n"

        for msg in messages:
            role = msg.get("role", "unknown").title()
            content = msg.get("content", "")
            md += f"## {role}\n\n{content}\n\n"

        md += "---\n*Exported by Alfred Agent Platform*\n"
        return md


if __name__ == "__main__":
    server = HTTPServer(("localhost", 8091), ChatExportHandler)
    print("🚀 Test export server running on http://localhost:8091")
    print("📁 Export endpoint: http://localhost:8091/architect/export")
    print("❤️  Health check: http://localhost:8091/healthz")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server shutting down")
        server.shutdown()
