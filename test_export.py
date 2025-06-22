#!/usr/bin/env python3
"""
Test chat export functionality without dependencies
"""


def _messages_to_markdown(msgs):
    md = ["# Architect Chat Export\n"]
    for m in msgs:
        role = m.get("role", "user").title()
        content = m.get("content", "")
        md.append(f"## {role}\n\n{content}\n")
    return "\n".join(md)


# Test the function
if __name__ == "__main__":
    msgs = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there! How can I help you today?"},
    ]

    result = _messages_to_markdown(msgs)
    print("=== Chat Export Test ===")
    print(result)
    print("=== End Test ===")

    # Write to file
    with open("test-export.md", "w") as f:
        f.write(result)
    print("✅ Export written to test-export.md")
