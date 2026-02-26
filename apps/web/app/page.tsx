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
  Sparkles,
  MousePointer2,
} from "lucide-react";
import { RxArrowTopRight } from "react-icons/rx";
import { TbBeta } from "react-icons/tb";
import { BsTwitterX } from "react-icons/bs";
import { FiLinkedin, FiGithub } from "react-icons/fi";
import { FaCode } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BackgroundBlobs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <motion.div
        animate={{
          x: [0, 50, 0, -50, 0],
          y: [0, -50, 0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-green-500/30 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -60, 0, 60, 0],
          y: [0, 60, 0, -60, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 40, 0, -40, 0],
          y: [0, -30, 0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]"
      />
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
};

const ScribbleCanvas = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div
        className="fixed pointer-events-none z-50 text-green-400 opacity-60 mix-blend-screen"
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: isHovering ? 1.5 : 0,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        <Sparkles size={32} />
      </motion.div>
    </div>
  );
};

export default function Page() {
  return (
    <div className="w-full min-h-screen h-fit overflow-x-hidden bg-neutral-950 text-white font-nunito-variable selection:bg-green-500/30">
      <BackgroundBlobs />
      <section
        id="hero"
        className="relative w-full min-h-[90vh] flex flex-col justify-center items-center text-center px-4 pt-20 pb-20"
      >
        <ScribbleCanvas />
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-6 left-6 z-20"
        >
          <span className="text-white text-3xl font-bold font-pencerio tracking-wide hover:text-green-400 transition-colors cursor-default">
            creo
          </span>
        </motion.div>
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-8 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-semibold flex items-center gap-2 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            The whiteboard that doesn't feel like work
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", mass: 1, damping: 20, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-cabinet-grotesk tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-600 py-2 leading-[1.1]"
          >
            Jump in, draw together,&nbsp; <br className="hidden md:block"/>
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-white">make a mess.</span>
              <motion.span 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1 }}
                className="absolute -bottom-4 -left-4 -right-4 h-8 text-green-500 opacity-80 z-[-1] pointer-events-none"
              >
                <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="w-full h-full stroke-current fill-none stroke-[4px] stroke-linecap-round">
                  <path d="M5,15 Q50,-5 100,10 T195,5" />
                </svg>
              </motion.span>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-lg md:text-xl text-neutral-400 max-w-2xl font-medium"
          >
            No boring corporate logins. No clunky menus. Just grab a link, invite your friends or team, and start ideating in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-6"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="group relative px-8 py-6 bg-white text-black hover:bg-neutral-200 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Create a canvas (it's free) <MousePointer2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
              </Button>
            </Link>
            <div className="relative mt-8 sm:mt-0">
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="ghost"
                  className="px-8 py-6 rounded-2xl font-bold text-lg border-2 border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Play with the Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-neutral-950 z-10 pointer-events-none" />
      </section>

      <section id="features" className="py-24 px-4 relative z-10 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black font-cabinet-grotesk mb-4 text-white">
              Silly simple, yet shockingly powerful.
            </h2>
            <p className="text-neutral-400 text-lg">Everything you need to collaborate, packed into a gorgeous dark canvas.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[250px]">
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-1 rounded-3xl bg-neutral-900/40 border border-white/5 p-8 flex flex-col justify-between overflow-hidden relative group backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] group-hover:bg-green-500/20 transition-colors" />
              <div>
                <Feather className="w-10 h-10 text-green-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2 font-cabinet-grotesk">Zero Latency Drawing</h3>
                <p className="text-neutral-400 max-w-sm">We engineered the WebSocket layer so perfectly that you'll forget your friends are 3,000 miles away. The ink flows like magic.</p>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-1 md:row-span-1 rounded-3xl bg-neutral-900/40 border border-white/5 p-8 flex flex-col justify-between relative group backdrop-blur-sm"
            >
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-colors" />
              <div>
                <MessageSquare className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-cabinet-grotesk">Trash Talk in Chat</h3>
                <p className="text-neutral-400 text-sm">Built-in side chat so you can judge their drawing skills in real-time.</p>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-1 md:row-span-1 rounded-3xl bg-neutral-900/40 border border-white/5 p-8 flex flex-col justify-between relative group backdrop-blur-sm"
            >
              <div className="absolute top-0 left-0 w-40 h-40 bg-pink-500/10 rounded-full blur-[60px] group-hover:bg-pink-500/20 transition-colors" />
              <div>
                <Share2 className="w-10 h-10 text-pink-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-cabinet-grotesk">1-Click Invites</h3>
                <p className="text-neutral-400 text-sm">Send a link. That's it. No complicated access requests or emails.</p>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-1 rounded-3xl bg-neutral-900/40 border border-white/5 p-8 flex flex-col justify-between relative group overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent group-hover:from-purple-500/20 transition-colors" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <Users className="w-10 h-10 text-purple-400 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2 font-cabinet-grotesk">Any Browser, Any Device</h3>
                  <p className="text-neutral-400 max-w-md">Open it on Chrome, Safari, your massive desktop monitor, or your tiny phone screen. It just works. Period.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-24 px-4 relative z-10 bg-neutral-900/20 border-y border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl md:text-6xl font-black font-cabinet-grotesk text-white mb-6">
              Who is this even for?
            </h2>
            <div className="w-24 h-1.5 bg-green-400 mx-auto rounded-full -rotate-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:px-10 mt-12">
            <motion.div 
              initial={{ rotate: -5, y: 20 }}
              whileInView={{ rotate: -2, y: 0 }}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 shadow-2xl relative overflow-hidden group cursor-default"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] group-hover:bg-blue-500/40 transition-colors" />
              <div className="text-6xl mb-6 mix-blend-luminosity group-hover:mix-blend-normal transition-all group-hover:scale-110 origin-left">💻</div>
              <h3 className="text-2xl font-bold mb-3 font-cabinet-grotesk text-white">Remote Teams</h3>
              <p className="text-neutral-400 leading-relaxed font-medium">Stop pointing at your screen on Zoom. Draw architecture diagrams or wireframes directly together in real-time.</p>
            </motion.div>
            
            <motion.div 
              initial={{ y: 30 }}
              whileInView={{ y: 0 }}
              whileHover={{ scale: 1.05, zIndex: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 shadow-2xl relative overflow-hidden group cursor-default"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-[50px] group-hover:bg-yellow-500/40 transition-colors" />
              <div className="text-6xl mb-6 mix-blend-luminosity group-hover:mix-blend-normal transition-all group-hover:scale-110 origin-left">🎓</div>
              <h3 className="text-2xl font-bold mb-3 font-cabinet-grotesk text-white">Teachers & Tutors</h3>
              <p className="text-neutral-400 leading-relaxed font-medium">Explain math problems visually or diagram history timelines. The kids will actually pay attention.</p>
            </motion.div>
            
            <motion.div 
              initial={{ rotate: 5, y: 20 }}
              whileInView={{ rotate: 2, y: 0 }}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 shadow-2xl relative overflow-hidden group cursor-default"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-[50px] group-hover:bg-pink-500/40 transition-colors" />
              <div className="text-6xl mb-6 mix-blend-luminosity group-hover:mix-blend-normal transition-all group-hover:scale-110 origin-left">🎨</div>
              <h3 className="text-2xl font-bold mb-3 font-cabinet-grotesk text-white">Goofballs</h3>
              <p className="text-neutral-400 leading-relaxed font-medium">Just want to play tic-tac-toe or draw weird pictures with your long-distance friends? Perfect.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-16 px-4 pb-0 overflow-hidden relative">
        <div className="container mx-auto text-center z-10 relative">
          
          <div className="mb-24 flex flex-col items-center">
            <h3 className="text-4xl font-black text-white mb-10 font-cabinet-grotesk tracking-tight">Ready to make a mess?</h3>
            <Link href="/signup">
              <button 
                className="group relative cursor-pointer flex items-center justify-center gap-2 rounded-[2rem] px-12 py-5 bg-green-500 text-black font-black text-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_80px_-15px_rgba(34,197,94,0.8)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[pulse_1.5s_infinite] skew-x-[-20deg]" />
                <span className="relative z-10">Let's go</span>
                <RxArrowTopRight className="relative z-10 w-6 h-6 group-hover:rotate-45 group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </Link>
          </div>

          <div className="flex justify-center items-center gap-8 mb-12">
            {[
              { icon: <BsTwitterX />, link: "https://x.com/I_Break_Prod" },
              { icon: <FiLinkedin />, link: "https://www.linkedin.com/in/ibreakprod" },
              { icon: <Globe />, link: "https://hrsht.me" },
              { icon: <FiGithub />, link: "https://github.com/ibreakprod" },
              { icon: <FaCode />, link: "http://github.com/iBreakProd/creo" },
            ].map((social, i) => (
              <motion.a
                key={i}
                whileHover={{ y: -5, color: "#4ade80" }}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition-colors cursor-pointer text-2xl"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
        <div className="w-full flex justify-center translate-y-20 select-none relative group pointer-events-auto cursor-default">
          <div className="text-[120px] sm:text-[180px] md:text-[250px] lg:text-[350px] font-pencerio font-bold text-transparent bg-clip-text bg-gradient-to-b from-neutral-800/80 to-neutral-950 leading-none tracking-tighter mix-blend-screen transition-opacity duration-700 group-hover:opacity-0">
            &nbsp;creo&nbsp;&nbsp;
          </div>
          <div className="absolute inset-x-0 top-0 flex justify-center text-[120px] sm:text-[180px] md:text-[250px] lg:text-[350px] font-pencerio font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-500 to-green-900 leading-none tracking-tighter drop-shadow-[0_0_80px_rgba(34,197,94,0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            &nbsp;creo&nbsp;&nbsp;
          </div>
        </div>
      </footer>
    </div>
  );
}
