"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Server, Monitor, History, Terminal, MousePointer2 } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-nunito-variable selection:bg-green-500/30 selection:text-green-100">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 lg:py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-8 h-8 text-neutral-500" />
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black font-cabinet-grotesk tracking-tighter text-white">
              Under the Hood.
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl leading-relaxed">
            A deeper look into how Creo is built. We focused on optimizing two main areas: synchronizing real-time collaboration efficiently and rendering complex 2D vector data smoothly without taxing the browser's DOM.
          </p>
        </motion.div>

        <div className="space-y-32">
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            <div className="lg:col-span-5">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_30px_-5px_var(--color-green-500)]">
                <Server className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-cabinet-grotesk">Low-Latency WebSocket Sync</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                To handle real-time vector drawing, HTTP polling introduces too much overhead. We opted for a lightweight Node server using the `ws` package to maintain persistent TCP connections with clients.
              </p>
              <ul className="space-y-3 text-neutral-300 font-medium list-none p-0">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✦</span>
                  Active room connections are managed in an in-memory `Map` for fast O(1) lookups.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✦</span>
                  The server filters out the sender ID before broadcasting so vectors are only sent to other collaborators in the room.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✦</span>
                  Data payloads are kept intentionally small, transmitting only essential coordinate updates to minimize bandwidth.
                </li>
              </ul>
            </div>
            
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-neutral-500 font-mono">ws-server/src/index.ts</div>
              </div>
              <div className="p-6 overflow-x-auto w-full text-sm font-mono leading-relaxed text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <pre className="min-w-0"><code>
  <span className="text-pink-400">case</span> <span className="text-green-300">"cursor"</span>: {"{"}<br/>
  &nbsp;&nbsp;<span className="text-blue-400">const</span> socks = activeRooms.<span className="text-yellow-200">get</span>(msg.roomId);<br/>
  <br/>
  &nbsp;&nbsp;<span className="text-neutral-500">// Broadcast cursor only to peers</span><br/>
  &nbsp;&nbsp;socks?.<span className="text-yellow-200">forEach</span>((m) <span className="text-pink-400">=&gt;</span> {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if</span> (m.socket !== socket) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;m.socket.<span className="text-yellow-200">send</span>(<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">JSON</span>.<span className="text-yellow-200">stringify</span>({"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;type: <span className="text-green-300">"cursor"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...msg.data<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"})<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;);<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
  &nbsp;&nbsp;{"}"});<br/>
  &nbsp;&nbsp;<span className="text-pink-400">break</span>;<br/>
  {"}"}<br/>
                </code></pre>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            <div className="lg:col-span-7 lg:order-1 order-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-neutral-500 font-mono">apps/web/components/canvas/Canvas.tsx</div>
              </div>
              <div className="p-6 overflow-x-auto w-full text-sm font-mono leading-relaxed text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <pre className="min-w-0"><code>
  <span className="text-blue-400">let</span> frameId: <span className="text-green-300">number</span>;<br/>
  <br/>
  <span className="text-blue-400">const</span> render = () <span className="text-pink-400">=&gt;</span> {"{"}<br/>
  &nbsp;&nbsp;<span className="text-yellow-200">renderDraws</span>(ctx, canvas, diagrams, ...);<br/>
  &nbsp;&nbsp;<span className="text-neutral-500">// Syncs with monitor refresh rate</span><br/>
  &nbsp;&nbsp;frameId = <span className="text-yellow-200">requestAnimationFrame</span>(render);<br/>
  {"}"};<br/>
  <br/>
  frameId = <span className="text-yellow-200">requestAnimationFrame</span>(render);<br/>
                </code></pre>
              </div>
            </div>

            <div className="lg:col-span-5 lg:order-2 order-1">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_-5px_var(--color-blue-500)]">
                <Monitor className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-cabinet-grotesk">Optimizing the Render Loop</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                React's Virtual DOM is excellent for declarative UIs, but it wasn't designed for handling 60 frames per second of complex 2D vector mathematics. Updating state on every mouse movement would cause massive performance drops.
              </p>
              <ul className="space-y-3 text-neutral-300 font-medium list-none p-0">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✦</span>
                  <div>
                    Instead, we use the Browser API's <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">requestAnimationFrame</code> to sync canvas re-renders with the user's specific monitor refresh rate.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✦</span>
                  <div>
                    Drawing state (like current coordinates and vectors) is stored entirely in mutable React Refs (<code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">useRef</code>) to bypass the React reconciler.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">✦</span>
                  <div>
                    The actual DOM elements remain static, while the <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">CanvasRenderingContext2D</code> actively paints the math directly to pixels.
                  </div>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            <div className="lg:col-span-5">
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 border border-pink-500/20 shadow-[0_0_30px_-5px_var(--color-pink-500)]">
                <History className="w-6 h-6 text-pink-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-cabinet-grotesk">Deterministic History Buffers</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Building an undo/redo feature by saving a clone of the entire canvas state after every stroke scales poorly and can quickly spike memory usage during long drawing sessions.
              </p>
              <ul className="space-y-3 text-neutral-300 font-medium list-none p-0">
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">✦</span>
                  <div>
                    Instead, we adopted a deterministic "Action" buffer that stores lightweight JSON deltas of what specifically changed.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">✦</span>
                  <div>
                    Actions map linearly representing modifications between <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">originalDraw</code> and <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">modifiedDraw</code> states.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">✦</span>
                  <div>
                    When undoing, the engine isolates the relevant shape and interpolates its state backwards.
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-neutral-500 font-mono">apps/web/types/index.ts</div>
              </div>
              <div className="p-6 overflow-x-auto w-full text-sm font-mono leading-relaxed text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <pre className="min-w-0"><code>
  <span className="text-pink-400">export type</span> <span className="text-yellow-200">Action</span> = {"{"}<br/>
  &nbsp;&nbsp;type: <span className="text-green-300">"create" | "erase" | "edit"</span>;<br/>
  &nbsp;&nbsp;originalDraw: <span className="text-yellow-200">Draw</span> | <span className="text-blue-300">null</span>;<br/>
  &nbsp;&nbsp;modifiedDraw: <span className="text-yellow-200">Draw</span> | <span className="text-blue-300">null</span>;<br/>
  {"}"};<br/>
  <br/>
  <span className="text-neutral-500">// Recording purely the delta state</span><br/>
  <span className="text-blue-400">const</span> action: <span className="text-yellow-200">Action</span> = {"{"}<br/>
  &nbsp;&nbsp;type: <span className="text-green-300">"edit"</span>,<br/>
  &nbsp;&nbsp;originalDraw: <span className="text-yellow-200">clone</span>(originalState.current),<br/>
  &nbsp;&nbsp;modifiedDraw: <span className="text-yellow-200">clone</span>(selectedDraw.current),<br/>
  {"}"};<br/>
                </code></pre>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16"
          >
            <div className="lg:col-span-7 lg:order-1 order-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-neutral-500 font-mono">apps/web/lib/canvas/selectFunctions.ts</div>
              </div>
              <div className="p-6 overflow-x-auto w-full text-sm font-mono leading-relaxed text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <pre className="min-w-0"><code>
  <span className="text-pink-400">export function</span> <span className="text-yellow-200">getDrawAt</span>(x, y, diagrams) {"{"}<br/>
  &nbsp;&nbsp;<span className="text-neutral-500">// Reverse loop for top z-index hits</span><br/>
  &nbsp;&nbsp;<span className="text-pink-400">for</span> (<span className="text-blue-400">let</span> i = diagrams.length - <span className="text-orange-400">1</span>; i &gt;= <span className="text-orange-400">0</span>; i--) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> shape = diagrams[i];<br/>
  <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if</span> (shape.type === <span className="text-green-300">"rectangle"</span>) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if</span> (<span className="text-yellow-200">isPointInRect</span>(x, y, shape.box)) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> shape;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;{"}"} <span className="text-pink-400">else if</span> (shape.type === <span className="text-green-300">"line"</span>) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if</span> (<span className="text-yellow-200">isPointNearLine</span>(x, y, shape.points)) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> shape;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
  &nbsp;&nbsp;{"}"}<br/>
  &nbsp;&nbsp;<span className="text-pink-400">return</span> <span className="text-blue-300">null</span>;<br/>
  {"}"}<br/>
                </code></pre>
              </div>
            </div>

            <div className="lg:col-span-5 lg:order-2 order-1">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_30px_-5px_var(--color-yellow-500)]">
                <MousePointer2 className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-cabinet-grotesk">Mathematical Hit Detection</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Because we bypass the DOM, canvas shapes don't have built-in `onClick` events. We had to build our own geometric hit-detection engine from scratch.
              </p>
              <ul className="space-y-3 text-neutral-300 font-medium list-none p-0">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✦</span>
                  <div>
                    <strong>Z-Index Sorting:</strong> The selection engine parses the shape array in reverse to ensure you select the top-most shape if they overlap.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✦</span>
                  <div>
                    <strong>Geometry Calculation:</strong> Determines clicks using mathematical bounding boxes, point-line distance formulas, and circle radius checking.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✦</span>
                  <div>
                    <strong>Infinite Canvas Viewport:</strong> The <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">panOffset</code> and <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">zoomScale</code> variables dynamically adjust the mathematical offset of all these hit-boxes seamlessly.
                  </div>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Section 5: Vector Mutation & Resizing */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16 border-t border-neutral-800"
          >
            <div className="lg:col-span-5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_30px_-5px_var(--color-purple-500)]">
                <MousePointer2 className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-cabinet-grotesk">Vector Mutation & Scaling</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Scaling simple boxes is easy, but scaling complex non-linear shapes like Freehand drawings or multi-point lines requires continuous mathematical transformation based on relative anchor points.
              </p>
              <ul className="space-y-3 text-neutral-300 font-medium list-none p-0">
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✦</span>
                  <div>
                    <strong>Farthest Point Analysis:</strong> Before scaling a freehand drawing, the engine calculates the absolute mathematical bounds (the farthest X and Y coordinates in the cluster).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✦</span>
                  <div>
                    <strong>Proportional Transformation:</strong> When a user drags a bounding box corner, the engine calculates the new Width/Height ratio compared to the original bounds.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">✦</span>
                  <div>
                    <strong>Point Interpolation:</strong> The engine then maps every single individual dot along the vector path and multiplies its relative position by the new <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">scaleX</code> and <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">scaleY</code> factors, updating live in the render loop.
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-neutral-500 font-mono">apps/web/lib/canvas/updateFunctions.ts</div>
              </div>
              <div className="p-6 overflow-x-auto w-full text-sm font-mono leading-relaxed text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <pre className="min-w-0"><code>
  <span className="text-blue-400">case</span> <span className="text-green-300">"bottomRight"</span>: {"{"}<br/>
  &nbsp;&nbsp;selectedDraw.points!.forEach((point, index) <span className="text-pink-400">=&gt;</span> {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> orig = initialPoints[index]!;<br/>
  <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-neutral-500">// Transform relative X coordinates</span><br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> newWidth = x - farthestLeft;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> scaleX = newWidth / originalWidth;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> dx = orig.x - farthestLeft;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;point.x = farthestLeft + dx * scaleX;<br/>
  <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-neutral-500">// Transform relative Y coordinates</span><br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> newHeight = y - farthestTop;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> scaleY = newHeight / originalHeight;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> dy = orig.y - farthestTop;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;point.y = farthestTop + dy * scaleY;<br/>
  &nbsp;&nbsp;{"}"});<br/>
  &nbsp;&nbsp;<span className="text-pink-400">break</span>;<br/>
  {"}"}<br/>
                </code></pre>
              </div>
            </div>
          </motion.section>

          {/* Section 6: Fluid Mirroring & Text Handling */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16 border-t border-neutral-800"
          >
            <div className="lg:col-span-7 lg:order-1 order-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 text-xs text-neutral-500 font-mono">apps/web/lib/canvas/resizeMath.ts</div>
              </div>
              <div className="p-6 overflow-x-auto w-full text-sm font-mono leading-relaxed text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                <pre className="min-w-0"><code>
  <span className="text-neutral-500">// Graceful mirroring on negative scales</span><br/>
  <span className="text-blue-400">const</span> scaleX = newWidth / originalWidth;<br/>
  <span className="text-blue-400">const</span> scaleY = newHeight / originalHeight;<br/>
  <br/>
  <span className="text-neutral-500">// Text intercept logic</span><br/>
  <span className="text-pink-400">if</span> (shape.type === <span className="text-green-300">"text"</span>) {"{"}<br/>
  &nbsp;&nbsp;<span className="text-neutral-500">// Prevent text from flipping backwards</span><br/>
  &nbsp;&nbsp;shape.fontSize = <span className="text-blue-300">Math</span>.<span className="text-yellow-200">abs</span>(originalFontSize * scaleX);<br/>
  <br/>
  &nbsp;&nbsp;<span className="text-neutral-500">// Adjust origin to maintain position</span><br/>
  &nbsp;&nbsp;<span className="text-pink-400">if</span> (scaleX &lt; <span className="text-orange-400">0</span>) {"{"}<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;shape.x = anchorPointX - shape.width;<br/>
  &nbsp;&nbsp;{"}"}<br/>
  {"}"} <span className="text-pink-400">else</span> {"{"}<br/>
  &nbsp;&nbsp;<span className="text-yellow-200">applyVectorScale</span>(shape.points, scaleX, scaleY);<br/>
  {"}"}<br/>
                </code></pre>
              </div>
            </div>

            <div className="lg:col-span-5 lg:order-2 order-1">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_30px_-5px_var(--color-cyan-500)]">
                <MousePointer2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-cabinet-grotesk">Fluid Mirroring & Text Bounds</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Because resizing vectors is purely mathematical, negative scale factors allow users to fluidly mirror drawings simply by dragging the bounding box across its opposite axis. It's a highly intuitive and cool interaction.
              </p>
              <ul className="space-y-3 text-neutral-300 font-medium list-none p-0">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-500 mt-1">✦</span>
                  <div>
                    <strong>Continuous Mirroring:</strong> Drawing paths seamlessly flip in real-time as the cursor crosses the origin point on either the X or Y axis.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-500 mt-1">✦</span>
                  <div>
                    <strong>Text Anti-Mirroring:</strong> Mirroring is great for art, but reversed text is unreadable. The engine intelligently intercepts text elements during resize.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-500 mt-1">✦</span>
                  <div>
                    <strong>Absolute Font Scaling:</strong> By enforcing <code className="text-sm bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200">Math.abs()</code> on the font size and recalculating the structural origin, text layers scale appropriately without ever flipping backwards.
                  </div>
                </li>
              </ul>
            </div>
          </motion.section>
          
        </div>

        <div className="mt-32 pt-16 border-t border-neutral-800 text-center">
          <h3 className="text-3xl font-black text-white mb-8 font-cabinet-grotesk tracking-tight">Impressed? Try it out.</h3>
          <Link href="/signup">
            <button className="group relative cursor-pointer inline-flex items-center justify-center gap-2 rounded-[2rem] px-10 py-4 bg-white text-black font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)]">
              <span>Create a Free Account</span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
