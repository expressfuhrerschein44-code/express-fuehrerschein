/**
 * Express-Führerschein
 * Profile avatar display.
 */

import {
  cn,
} from "@/lib/utils";

export interface ProfileAvatarProps {
  src:
    string | null;

  firstName:
    string;

  lastName:
    string;

  size?:
    "sm"
    | "md"
    | "lg";

  className?:
    string;
}

function initials(
  firstName:
    string,

  lastName:
    string,
): string {
  return [
    firstName
      .trim()
      .charAt(
        0,
      ),

    lastName
      .trim()
      .charAt(
        0,
      ),
  ]
    .join(
      "",
    )
    .toUpperCase() ||
    "EF";
}

export function ProfileAvatar({
  src,
  firstName,
  lastName,
  size =
    "lg",
  className,
}: ProfileAvatarProps) {
  const sizing = {
    sm:
      "h-14 w-14 text-[16px]",

    md:
      "h-20 w-20 text-[22px]",

    lg:
      "h-28 w-28 text-[30px]",
  } as const;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-[linear-gradient(180deg,#F0F3F8_0%,#E3E8F0_100%)] ring-1 ring-[#E1E7EF]",
        sizing[
          size
        ],
        className,
      )}
    >
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              src
            }
            alt=""
            className="h-full w-full object-cover"
          />
        </>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-black text-[#243252]"
        >
          {
            initials(
              firstName,
              lastName,
            )
          }
        </div>
      )}
    </div>
  );
}
