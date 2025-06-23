import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

type Props = { markdown: string };
type State = { hasError: boolean };

export default class MarkdownRenderer extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Markdown render error:", err, info);
  }
  render(): ReactNode {
    if (this.state.hasError)
      return <pre className="whitespace-pre-wrap">{this.props.markdown}</pre>;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        components={{
          a: (p) => (
            <a {...p} className="text-blue-600 underline" target="_blank" rel="noreferrer" />
          ),
        }}
      >
        {this.props.markdown}
      </ReactMarkdown>
    );
  }
}