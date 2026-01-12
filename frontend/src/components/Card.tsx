/** Styled container component for wraping content sections with a uniform look. */
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({ children, className = "", style }: Props) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}
