import Image from "next/image";

import { cn } from "@/lib/utils";

export interface OfficialSignatureProps {
  className?: string;
  alt?: string;
  priority?: boolean;
}

const OFFICIAL_SIGNATURE_SRC =
  "/signatures/express-fuehrerschein-official-signature.png";

export function OfficialSignature({
  className,
  alt = "Signature officielle Express-Führerschein",
  priority = false,
}: OfficialSignatureProps) {
  return (
    <Image
      src={OFFICIAL_SIGNATURE_SRC}
      alt={alt}
      width={1536}
      height={1024}
      priority={priority}
      unoptimized
      draggable={false}
      sizes="(max-width: 640px) 280px, 420px"
      className={cn(
        "block h-auto w-full select-none object-contain",
        className,
      )}
    />
  );
}