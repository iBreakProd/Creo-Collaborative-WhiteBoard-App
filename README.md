# Creo: Real-Time Collaborative Canvas

Built by [Harshit](https://www.hrsht.me).

Creo is a high-performance, real-time collaborative whiteboarding application. The goal of this project was to explore the challenges of synchronizing complex, mutable state across multiple clients with minimal latency, while pushing the boundaries of what can be rendered smoothly in the browser.

This project served as a deep dive into building scalable, distributed systems using a modern monorepo architecture. 

## 🏗️ Architecture & Data Flow

Creo is architected as a full-stack Turborepo containing independent Node.js microservices and a Next.js frontend, sharing internal packages for types, UI components, and database schemas.

```mermaid
graph TD
    subgraph "Frontend (Next.js React)"
        Client["Client Browser\n(Canvas API & React)"]
        State["Local State Buffer\n(Zustand / Refs)"]
        Client <-->|User Input / Renders| State
    end

    subgraph "Backend Infrastructure"
        HTTP["HTTP API Server\n(Express)"]
        WS["WebSocket Server\n(Node.js 'ws')"]
    end

    subgraph "Persistence Layer"
        DB[("PostgreSQL Database\n(Prisma / Drizzle)")]
    end

    %% Flow connections
    Client -->|REST: Auth / Fetch Rooms| HTTP
    HTTP -->|Read/Write| DB
    
    State <-->|Bi-directional Sync\n(JSON Payloads)| WS
    WS -->|Persist Drawings/Chat| DB
```

### Core Components
- **HTTP API Server:** A RESTful Express service handling authentication, room creation, and initial metadata fetching.
- **WebSocket Server:** A lightweight Node `ws` server managing persistent TCP connections. It holds active rooms in memory (`Map<string, WebSocket[]>`) for O(1) routing, ensuring low-latency broadcasts of cursor movements and vector data.
- **Frontend (Next.js & Canvas):** A highly optimized React application that bypasses the Virtual DOM for real-time rendering.

## 🧠 Key Technical Decisions & Concepts

Building Creo required solving several interesting engineering problems. Here are some of the major decisions and the underlying concepts:

### 1. Bypassing the React DOM for the Render Loop
React is fantastic for declarative UIs, but its reconciliation process is too slow for 60FPS vector manipulation. 
**Decision:** I chose to store the entire drawing state (vectors, coordinates, properties) inside mutable `useRef` hooks rather than React state. 
**Result:** The UI remains static while the native Canvas API paints mathematical coordinate updates directly to the pixel buffer synced with the monitor's `requestAnimationFrame`. This allows Creo to render thousands of vectors without lag.

### 2. Low-Latency Binary/JSON Sync over WebSockets
HTTP polling is insufficient for collaborative drawing due to header overhead and request latency. 
**Decision:** I implemented an event-driven WebSocket server. When a user draws an element, the client maps the mouse delta to a mathematical vector array and sends a fast WebSocket payload. 
**Result:** The WS server filters the sender and broadcasts changes to peers in the same room in milliseconds. The payloads are kept minimal (deltas rather than full canvas dumps) to reduce bandwidth.

### 3. Mathematical Hit-Detection over DOM Events
Since everything is drawn on a single `<canvas>` element, there are no native DOM `onClick` events for individual shapes.
**Decision:** I built a custom, deterministic geometry engine. 
**Concept:** When a user clicks the screen, the engine iterates over the shape array in reverse (simulating a high Z-Index first), checking if the cursor's X/Y coordinates intersect with the mathematical bounding boxes or point-line distances of the vectors.

### 4. Deterministic Undo/Redo Buffers
Storing a complete clone of the canvas after every stroke quickly causes memory bloat.
**Decision:** I implemented a linearly mapped action buffer storing only *deltas*. 
**Concept:** When an action occurs, the engine generates an object describing the transition from `originalDraw` to `modifiedDraw`. When undoing, it isolates only the affected shape and reverse-interpolates its properties without touching the rest of the canvas.

### 5. Infinite Canvas Viewport Scaling
**Decision:** I decoupled the screen coordinates from the theoretical workspace coordinates.
**Concept:** `panOffset` and `zoomScale` variables govern the lens through which you view the canvas. When rendering, every shape's absolute coordinate is passed through a transformation matrix (e.g., `(x * zoomScale) + panOffset.x`), allowing infinite panning and zooming without altering the core data structure.

### 6. Fluid Mirrored Resizing & Anti-Text Mirroing
**Decision:** Scaling complex vectors requires calculating a bounding box and then multiplying internal points by the calculated ratio (e.g., `newWidth / oldWidth`).
**Concept:** By intentionally allowing scaling ratios to slip into negative numbers, the engine permits users to "flip" shapes seamlessly across their axes. To prevent text from rendering backward, the engine intercepts text resizes, using `Math.abs()` on the resultant font size while recalculating the visual anchor point.

## 🚀 Future Roadmap

- **WebRTC Integration:** Exploring migration of the cursor-sync component from a centralized WebSocket Server to an un-reliable UDP-based WebRTC datachannel for true P2P, zero-latency cursor broadcasting.
- **Conflict Resolution:** Implementing a lightweight CRDT (Conflict-free Replicated Data Type) or operational transformation protocol to handle edge cases where two users attempt to mutate the identical shape concurrently.

---

*This project proved to be a fantastic exercise in pushing browser performance and orchestrating high-throughput state synchronization.*