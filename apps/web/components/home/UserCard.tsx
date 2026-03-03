"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { GiAlienFire, GiJetFighter } from "react-icons/gi";
import { useAppSelector } from "@/lib/hooks/redux";
import { useRouter } from "next/navigation";
import { BiChevronDown, BiLogOut } from "react-icons/bi";
import { signoutAction } from "@/actions/authActions";
import { useEffect } from "react";

const UserCard = () => {
  let user = useAppSelector((state) => state.app.user);
  const rooms = useAppSelector((state) => state.app.rooms);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      const SessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
      if (!SessionUser || SessionUser === null) {
        window.location.href = "/signin";
      }
      user = SessionUser;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Card className="backdrop-blur-md bg-black/50 hover:-translate-y-[2px] shadow hover:shadow-green-500/10 transition-all duration-300">
      <CardHeader className="-mb-4">
        <div className="flex w-full justify-between items-center">
          <CardTitle className="flex gap-1 items-center">
            {user.username}
            <GiJetFighter className="text-neutral-400 ml-1" size={22} />
          </CardTitle>
          <button
            className="cursor-pointer text-red-400 hover:text-red-500 transition-colors p-1"
            onClick={() => {
              signoutAction();
              sessionStorage.clear();
              router.replace("/signin");
            }}
            title="Sign Out"
          >
            <BiLogOut size={20} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>{user.name}</p>
        <p className="flex items-center gap-1">
          Total Canvases -
          {rooms?.length ? (
            <span className="">{rooms.length}</span>
          ) : (
            <GiAlienFire className="text-neutral-400 text-lg" />
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default UserCard;
