"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { BiInfoCircle } from "react-icons/bi";
import Link from "next/link";
import { signupAction } from "@/actions/authActions";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RequestCookie {
  name: string;
  value: string;
}
import { setUser } from "@/lib/features/meetdraw/appSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { toast } from "@workspace/ui/components/sonner";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full overflow-clip relative p-0 cursor-pointer transition-all duration-200 hover:bg-black hover:text-white border hover:border-green-600/20"
    >
      <div className="w-full h-full abolute flex items-center justify-center bg-linear-150 from-green-500/30 from-10% via-white/0 via-40% to-green-500/70 to-120%">
        {pending ? "Signing up..." : "Sign up"}
      </div>
    </Button>
  );
}

export default function SignupForm({
  jwtCookie,
}: {
  jwtCookie: RequestCookie | null;
}) {
  const initialState = { message: "", errors: {} };
  const [state, formAction] = useActionState(signupAction, initialState);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.app.user);
  const router = useRouter();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");

    if (sessionUser && jwtCookie && jwtCookie.value) {
      dispatch(setUser(JSON.parse(sessionUser)));
      router.replace("/home");
    } else if (state.user) {
      const user = {
        id: state.user.id,
        name: state.user.name,
        username: state.user.username,
      };
      sessionStorage.setItem("user", JSON.stringify(user));
      dispatch(setUser(user));
    }
  }, [state.user]);

  useEffect(() => {
    if (jwtCookie && jwtCookie.value && userState) {
      router.replace("/home");
    }
  }, [userState]);

  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state.message]);

  return (
    <Card className="w-full max-w-sm rounded-lg z-2 font-cabinet-grotesk tracking-wide">
      <CardHeader>
        <CardTitle className="text-2xl -mb-2">Signup</CardTitle>
        <CardDescription className="text-sm text-neutral-300">
          Create a new account to use{" "}
          <span className="font-pencerio font-bold tracking-wider">
            meetdraw
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-4 text-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  placeholder="John"
                  className="focus-visible:border-green-600/50 focus-visible:ring-green-600/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  type="text"
                  placeholder="Doe"
                  className="focus-visible:border-green-600/50 focus-visible:ring-green-600/20"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe123"
                className="focus-visible:border-green-600/50 focus-visible:ring-green-600/20"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                className="focus-visible:border-green-600/50 focus-visible:ring-green-600/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="verify-password">Verify Password</Label>
              <Input
                id="verify-password"
                name="verify-password"
                type="text"
                minLength={8}
                required
                className="focus-visible:border-green-600/50 focus-visible:ring-green-600/20"
              />
            </div>
            {state.message && (
              <p className="text-sm -my-1 -mb-3 text-red-500 flex gap-2 font-light items-center">
                <BiInfoCircle />
                {state.message}
              </p>
            )}
            <SubmitButton />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 -mt-3">
        <p className="self-start text-xs">
          Already have an account?{" "}
          <Link href={"/signin"} className="underline hover:text-green-500">
            Sign in.
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
