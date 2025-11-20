import React from "react";
import Image from "next/image";

import { cn } from "@mint-up/ui/lib/utils";

// Context for compound component
const NFTCardContext = React.createContext<unknown>(null);

interface NFTCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function NFTCard({ children, className, ...props }: NFTCardProps) {
  return (
    <NFTCardContext.Provider value={null}>
      <div
        className={cn(
          "group bg-card border-border/50 hover:border-border relative flex flex-col overflow-hidden rounded-xl border transition-all",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </NFTCardContext.Provider>
  );
}

interface NFTCardImageProps
  extends Omit<React.ComponentProps<typeof Image>, "src" | "alt"> {
  src: string;
  alt: string;
}

function NFTCardImage({ src, alt, className, ...props }: NFTCardImageProps) {
  return (
    <div className="bg-muted relative aspect-square w-full overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-transform duration-300 group-hover:scale-105",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NFTCardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-3", className)} {...props}>
      {children}
    </div>
  );
}

function NFTCardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "truncate leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function NFTCardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-muted-foreground mt-1 truncate text-xs", className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Export as Compound Component
export const NFT = Object.assign(NFTCard, {
  Image: NFTCardImage,
  Content: NFTCardContent,
  Title: NFTCardTitle,
  Description: NFTCardDescription,
});
