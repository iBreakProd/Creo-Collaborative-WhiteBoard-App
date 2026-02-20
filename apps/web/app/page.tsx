"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Code,
  Feather,
  MessageSquare,
  Share2,
  Users,
  Globe,
} from "lucide-react";
import { RxArrowTopRight } from "react-icons/rx";
import { TbBeta } from "react-icons/tb";
import { BsTwitterX } from "react-icons/bs";
import { FiLinkedin } from "react-icons/fi";
import { FiGithub } from "react-icons/fi";
import { FaCode } from "react-icons/fa6";

export default function Page() {
  return (
    <div className="w-full min-h-screen h-fit overflow-x-clip bg-neutral-950 text-white [&::-webkit-scrollbar]:hidden font-nunito-variable">
      <section
        id="hero"
        className="relative w-full h-screen flex flex-col justify-center items-center text-center px-4"
      >
        <h1 className="text-white/90 text-4xl font-bold font-pencerio absolute top-4 left-4">
          meetdraw
        </h1>
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-green-500/80 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold font-cabinet-grotesk bg-clip-text tracking-tight text-transparent bg-gradient-to-b from-neutral-50 to-neutral-700 py-1">
            Draw Together, <br className="block lg:hidden" /> Create Together
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-300/90 max-w-2xl">
            The collaborative whiteboard that brings your ideas to life.{" "}
            <br className="hidden md:block" />
            Draw, chat, and brainstorm in real-time with your team.
          </p>
          <div className="mt-8 flex flex-col items-center sm:flex-row gap-4">
            <Link href="/demo">
              <Button
                size="lg"
                className="w-full sm:w-auto cursor-pointer bg-neutral-400/20 backdrop-blur-[1px] border text-neutral-300 border-neutral-300/20 hover:bg-neutral-400/30 hover:border-neutral-300/30"
              >
                Try the Demo <RxArrowTopRight />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto cursor-pointer py-[20px] bg-black/20 backdrop-blur-[1.5px] border text-neutral-300 border-neutral-300/20 hover:bg-black/30 hover:border-neutral-300/30"
              >
                Create an account
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-neutral-400">
            No signup required for the demo
          </p>
        </div>
      </section>

      <section id="features" className="py-24 md:py-32 px-4 relative">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center tracking-tight font-cabinet-grotesk text-white">
              Everything you need to collaborate
            </h2>
            <div className="w-20 h-1 bg-green-500/50 mt-8 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 md:gap-x-12">
            {[
              {
                icon: <Feather size={28} />,
                title: "Real-time Drawing",
                desc: "Collaborative canvas with live feedback.",
              },
              {
                icon: <MessageSquare size={28} />,
                title: "Instant Chat",
                desc: "Built-in messaging while you work.",
              },
              {
                icon: <Share2 size={28} />,
                title: "Share & Join",
                desc: "One-click room sharing with anyone.",
              },
              {
                icon: <Users size={28} />,
                title: "Any Browser",
                desc: "Works seamlessly on Chrome, Safari, and Edge.",
              },
              {
                icon: <Code size={28} />,
                title: "Lightning Fast",
                desc: "No lag, instant synchronization.",
              },
              {
                icon: <TbBeta size={28} />,
                title: "Coming Soon",
                desc: "Voice & video calls.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group flex flex-col items-start p-6 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                <div className="text-green-500/80 mb-6 p-3 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 font-cabinet-grotesk tracking-wide text-neutral-200 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="py-24 md:py-32 px-4 relative"
      >
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center tracking-tight font-cabinet-grotesk text-white">
              How It Works
            </h2>
            <div className="w-20 h-1 bg-green-500/50 mt-8 rounded-full" />
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 max-w-5xl mx-auto">
            <div className="absolute top-[32px] left-[15%] w-[70%] h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent hidden md:block"></div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-green-500/30 flex items-center justify-center text-2xl font-bold font-cabinet-grotesk mb-6 z-10 text-green-400 group-hover:border-green-400 group-hover:bg-green-500/10 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(34,197,94,0.1)]">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3 font-cabinet-grotesk text-neutral-200">Create or Join</h3>
              <p className="text-neutral-400 leading-relaxed max-w-[250px]">
                Start a new board or enter a room code instantly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-green-500/30 flex items-center justify-center text-2xl font-bold font-cabinet-grotesk mb-6 z-10 text-green-400 group-hover:border-green-400 group-hover:bg-green-500/10 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(34,197,94,0.1)]">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3 font-cabinet-grotesk text-neutral-200">Draw & Chat</h3>
              <p className="text-neutral-400 leading-relaxed max-w-[250px]">
                Collaborate with real-time tools and fluid messaging.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-green-500/30 flex items-center justify-center text-2xl font-bold font-cabinet-grotesk mb-6 z-10 text-green-400 group-hover:border-green-400 group-hover:bg-green-500/10 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(34,197,94,0.1)]">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3 font-cabinet-grotesk text-neutral-200">Share Ideas</h3>
              <p className="text-neutral-400 leading-relaxed max-w-[250px]">
                Save and securely continue your session later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-24 md:py-32 px-4 relative">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-center tracking-tight font-cabinet-grotesk text-white">
              Perfect For...
            </h2>
            <div className="w-20 h-1 bg-green-500/50 mt-8 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-x-16">
            <div className="flex flex-col border-l-2 border-green-500/20 pl-8 hover:border-green-500/50 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4 font-cabinet-grotesk text-neutral-200">Remote Teams</h3>
              <p className="text-neutral-400 leading-relaxed">
                Daily standups, sprint planning, and brainstorming sessions that
                feel like you're in the exact same room.
              </p>
            </div>
            <div className="flex flex-col border-l-2 border-blue-500/20 pl-8 hover:border-blue-500/50 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4 font-cabinet-grotesk text-neutral-200">Education</h3>
              <p className="text-neutral-400 leading-relaxed">
                Interactive lessons, student collaboration, and visual learning
                that visually engages the entire classroom.
              </p>
            </div>
            <div className="flex flex-col border-l-2 border-purple-500/20 pl-8 hover:border-purple-500/50 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4 font-cabinet-grotesk text-neutral-200">Creative Work</h3>
              <p className="text-neutral-400 leading-relaxed">
                Design reviews, wireframing, and creative workshops where ideas
                can flow freely across the canvas.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="footer" className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-around items-center mb-[200px] md:mb-[300px]">
            <div className="hover:scale-110 transition-all duration-300">
              <a
                href="https://x.com/I_Break_Prod"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <BsTwitterX className="w-6 h-6 md:w-7 md:h-7" />
              </a>
            </div>
            <div className="hover:scale-110 transition-all duration-300">
              <a
                href="https://www.linkedin.com/in/ibreakprod"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiLinkedin className="w-6 h-6 md:w-7 md:h-7" />
              </a>
            </div>
            <div className="hover:scale-110 transition-all duration-300">
              <a
                href="https://hrsht.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Globe className="w-6 h-6 md:w-7 md:h-7" />
              </a>
            </div>
            <div className="hover:scale-110 transition-all duration-300">
              <a
                href="https://github.com/ibreakprod"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiGithub className="w-6 h-6 md:w-7 md:h-7" />
              </a>
            </div>
            <div className="hover:scale-110 transition-all duration-300">
              <a
                href="http://github.com/iBreakProd/creo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaCode className="w-6 h-6 md:w-7 md:h-7" />
              </a>
            </div>
          </div>
          <div className="flex w-full items-center justify-center cursor-default">
            <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[200px] font-pencerio font-bold bg-clip-text text-transparent bg-gradient-to-b from-green-500/45 to-green-900/45 px-4 md:px-10 leading-none">
              meetdraw
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
