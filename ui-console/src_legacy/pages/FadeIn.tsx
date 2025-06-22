import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  direction?: string;
  duration?: number;
  delay?: number;
}

export default function FadeIn({ children, duration, delay }: Props) {
  const style = {
    animationDelay: delay ? `${delay}ms` : undefined,
    animationDuration: duration ? `${duration}ms` : undefined,
  };
  
  return (
    <div 
      className="animate-in fade-in duration-500" 
      style={style}
    >
      {children}
    </div>
  );
}