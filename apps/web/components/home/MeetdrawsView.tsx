"use client";

import { Input } from "@workspace/ui/components/input";
import { BiSearch } from "react-icons/bi";
import MeetdrawCard from "./MeetdrawCard";
import { useAppSelector } from "@/lib/hooks/redux";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GiSolarSystem } from "react-icons/gi";

const MeetdrawsView = () => {
  const meetdrawsViewDivRef = useRef<HTMLDivElement>(null);
  const rooms = useAppSelector((state) => state.app.rooms) || [];
  const [showArrow, setShowArrow] = useState<"down" | "up" | null>(null);
  const [search, setSearch] = useState("");

  if (!rooms) {
    return null;
  }

  const filteredRooms = rooms.filter((room) =>
    room.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (
      meetdrawsViewDivRef.current?.scrollHeight &&
      meetdrawsViewDivRef.current?.clientHeight &&
      meetdrawsViewDivRef.current.scrollHeight >
        meetdrawsViewDivRef.current.clientHeight
    ) {
      if (
        meetdrawsViewDivRef.current?.scrollTop &&
        meetdrawsViewDivRef.current.scrollTop > 0
      ) {
        setShowArrow("up");
      } else {
        setShowArrow("down");
      }
    } else {
      setShowArrow(null);
    }

    const handleScroll = () => {
      if (
        meetdrawsViewDivRef.current?.scrollTop &&
        meetdrawsViewDivRef.current.scrollTop > 0
      ) {
        setShowArrow("up");
      } else {
        setShowArrow("down");
      }
    };

    meetdrawsViewDivRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      meetdrawsViewDivRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h3 className="text-xl font-medium">Your Canvases</h3>

        <div className="relative w-fit flex items-center rounded-lg">
          <Input
            className="max-w-72 min-w-72 relative focus-visible:border-green-600/50 focus-visible:ring-green-600/20"
            placeholder="Type to search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          ></Input>
          <div className="bg-transparent absolute right-0 rounded-lg py-2 pr-3">
            <BiSearch className="" />
          </div>
        </div>
      </div>
      {filteredRooms.length === 0 && (
        <div className="flex-1 flex justify-center gap-2 text-neutral-400">
          <p>Looks like you're alone... </p>
          <div className="flex">
            <GiSolarSystem className="text-2xl rotate-y-180" />
            <GiSolarSystem className="text-2xl -ml-[1.75px]" />
          </div>
        </div>
      )}
      <div
        ref={meetdrawsViewDivRef}
        className="grid grid-cols-3 auto-rows-min gap-4 flex-1 min-h-0 overflow-y-auto py-1 [&::-webkit-scrollbar]:hidden"
      >
        {filteredRooms.map((room) => (
          <MeetdrawCard key={room.id} room={room} />
        ))}
        {showArrow === "up" && (
          <button
            onClick={() => {
              meetdrawsViewDivRef.current?.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="absolute bottom-0 right-0 rounded-full bg-neutral-900 border p-3 m-2 cursor-pointer"
          >
            <FaChevronUp className="text-2xl text-neutral-400" size={16} />
          </button>
        )}
        {showArrow === "down" && (
          <button
            onClick={() => {
              meetdrawsViewDivRef.current?.scrollTo({
                top: meetdrawsViewDivRef.current.scrollHeight,
                behavior: "smooth",
              });
            }}
            className="absolute bottom-0 right-0 rounded-full bg-neutral-900 border p-3 m-2 cursor-pointer"
          >
            <FaChevronDown className="text-2xl text-neutral-400" size={16} />
          </button>
        )}
      </div>
    </>
  );
};

export default MeetdrawsView;
