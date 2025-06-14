import { NextResponse } from "next/server"
import { Server } from "socket.io"
import { runPythonInteractive } from "@/lib/runners/pythonRunner"
import { runJavaInteractive } from "@/lib/runners/javaRunner"

// Initialize Socket.IO server
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`[SERVER] User connected: ${socket.id}`)

  socket.on("run_code", async ({ language, code, input }) => {
    console.log(`[SERVER] Received run_code request from ${socket.id} for ${language}`)
    console.log("[SERVER] Code (first 100 chars):", code.substring(0, 100))
    console.log("[SERVER] Initial Input:", input)

    // Clear previous output for this session
    socket.emit("output", { type: "clear" })

    try {
      if (language === "python") {
        await runPythonInteractive(socket, code, input)
      } else if (language === "java") {
        await runJavaInteractive(socket, code, input)
      } else {
        socket.emit("output", { type: "error", data: "Unsupported language" })
        socket.emit("execution_end")
      }
    } catch (err) {
      console.error("[SERVER] Error during code execution:", err)
      socket.emit("output", { type: "error", data: `Server error: ${err.message || err}` })
      socket.emit("execution_end")
    }
  })

  socket.on("input", ({ data }) => {
    // This will be handled by the runners, which will pipe to child_process stdin
    console.log(`[SERVER] Received input from ${socket.id}: ${data.trim()}`)
  })

  socket.on("disconnect", () => {
    console.log(`[SERVER] User disconnected: ${socket.id}`)
  })
})

// Start the server
io.listen(5000)

export async function POST(req: Request) {
  try {
    const { language, code, input } = await req.json()

    if (!language || !code) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 }
      )
    }

    // The actual code execution will be handled by WebSocket
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
} 