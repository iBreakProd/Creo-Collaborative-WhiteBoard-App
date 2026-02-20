import SigninForm from "@/components/auth/SigninForm";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function page() {
  const jwtCookie = (await cookies()).get("jwt");

  return (
    <div className="w-screen h-screen relative flex items-center justify-center">
      <Link
        className="fixed text-white top-2 left-3 text-3xl font-pencerio cursor-pointer"
        href="/"
      >
        meetdraw
      </Link>
      <div className="absolute h-[150px] w-[300px] -translate-y-25 -translate-x-15 bg-linear-90 from-green-500 via-green-500 to-green-400 z-1 blur-[120px]" />
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <SigninForm jwtCookie={jwtCookie || null} />
    </div>
  );
}
