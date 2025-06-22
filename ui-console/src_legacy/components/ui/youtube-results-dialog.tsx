import type { ReactNode } from "react";

interface Props {
  trigger: ReactNode;
}

export default function YouTubeResultsDialog({ trigger }: Props) {
  return <>{trigger}</>;
}