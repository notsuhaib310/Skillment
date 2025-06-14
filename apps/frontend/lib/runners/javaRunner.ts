import { Socket } from "socket.io"
import { io } from "socket.io-client"

const CODE_RUNNER_URL = "http://localhost:5000"

export interface RunResult {
  output: string
  error?: string
  exitCode: number
}

export const runJavaInteractive = (
  socket: Socket,
  code: string,
  initialInput?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Connect to the code-runner server
      const runnerSocket = io(CODE_RUNNER_URL)

      runnerSocket.on("connect", () => {
        console.log("[JAVA RUNNER] Connected to code-runner server")
        // Forward the code execution request
        runnerSocket.emit("run_code", {
          language: "java",
          code,
          input: initialInput
        })
      })

      // Forward output from code-runner to client
      runnerSocket.on("output", (data) => {
        socket.emit("output", data)
      })

      // Handle execution end
      runnerSocket.on("execution_end", (data) => {
        socket.emit("execution_end", data)
        runnerSocket.disconnect()
        resolve()
      })

      // Handle errors
      runnerSocket.on("error", (error) => {
        socket.emit("output", { type: "error", data: error })
        runnerSocket.disconnect()
        reject(new Error(error))
      })

      // Forward client input to code-runner
      socket.on("input", (data) => {
        runnerSocket.emit("input", data)
      })

      // Handle disconnection
      runnerSocket.on("disconnect", () => {
        console.log("[JAVA RUNNER] Disconnected from code-runner server")
      })

      // Clean up on error
      socket.on("disconnect", () => {
        runnerSocket.disconnect()
      })
    } catch (error) {
      console.error("[JAVA RUNNER] Error:", error)
      socket.emit("output", { type: "error", data: `Runner setup error: ${error instanceof Error ? error.message : String(error)}` })
      socket.emit("execution_end")
      reject(error)
    }
  })
} 