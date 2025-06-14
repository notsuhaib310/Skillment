import { Socket } from "socket.io"
import { io } from "socket.io-client"

const CODE_RUNNER_URL = "http://localhost:5000"

export interface RunResult {
  output: string
  error?: string
  exitCode: number
}

let runnerSocket: ReturnType<typeof io> | null = null

export const runPythonInteractive = (
  socket: Socket,
  code: string,
  initialInput?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Reuse existing socket or create new one
      if (!runnerSocket || !runnerSocket.connected) {
        runnerSocket = io(CODE_RUNNER_URL, {
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 10000
        })
      }

      // Set up event handlers
      const setupSocket = () => {
        if (!runnerSocket) return

        // Forward output from code-runner to client
        runnerSocket.on("output", (data) => {
          socket.emit("output", data)
        })

        // Handle execution end
        runnerSocket.on("execution_end", (data) => {
          socket.emit("execution_end", data)
          resolve()
        })

        // Handle errors
        runnerSocket.on("error", (error) => {
          socket.emit("output", { type: "error", data: error })
          reject(new Error(error))
        })

        // Forward client input to code-runner
        socket.on("input", (data) => {
          if (runnerSocket?.connected) {
            runnerSocket.emit("input", data)
          }
        })

        // Handle disconnection
        runnerSocket.on("disconnect", () => {
          console.log("[PYTHON RUNNER] Disconnected from code-runner server")
        })

        // Clean up on error
        socket.on("disconnect", () => {
          if (runnerSocket) {
            runnerSocket.disconnect()
            runnerSocket = null
          }
        })
      }

      // If already connected, set up handlers and run code
      if (runnerSocket.connected) {
        setupSocket()
        runnerSocket.emit("run_code", {
          language: "python",
          code,
          input: initialInput
        })
      } else {
        // If not connected, wait for connection
        runnerSocket.on("connect", () => {
          console.log("[PYTHON RUNNER] Connected to code-runner server")
          setupSocket()
          runnerSocket?.emit("run_code", {
            language: "python",
            code,
            input: initialInput
          })
        })
      }
    } catch (error) {
      console.error("[PYTHON RUNNER] Error:", error)
      socket.emit("output", { 
        type: "error", 
        data: `Runner setup error: ${error instanceof Error ? error.message : String(error)}` 
      })
      socket.emit("execution_end")
      reject(error)
    }
  })
} 