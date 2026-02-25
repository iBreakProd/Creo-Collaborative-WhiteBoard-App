"use client";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export interface LinkButtonprops {
  children: ReactNode;
  href: string;
  variant?: "default" | "ghost";
  className?: string;
}

const LinkButton = ({
  children,
  href,
  variant,
  className,
}: LinkButtonprops) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push(href)}
      className={`overflow-clip relative p-0 cursor-pointer transition-all duration-500 hover:bg-black hover:text-white border border-black hover:border-green-600/30 ${className}`}
    >
      {variant === "ghost" ? (
        <div className="w-full h-full p-[0.5px] abolute flex items-center justify-center bg-linear-150 from-green-500/30 from-10% via-white/0 via-40% to-green-500/70 to-120%">
          <div className="w-full h-full flex items-center justify-center bg-black rounded-[7px] text-white hover:text-green-500/70 px-6 transition-all duration-200">
            {children}
          </div>
        </div>
      ) : (
        <div className="w-full h-full px-6 abolute flex items-center justify-center bg-linear-150 from-green-500/30 from-10% via-white/0 via-40% to-green-500/70 to-120%">
          {children}
        </div>
      )}
    </Button>
  );
};

export default LinkButton;
