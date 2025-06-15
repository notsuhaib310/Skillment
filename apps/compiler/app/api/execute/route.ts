import { type NextRequest, NextResponse } from "next/server"

const JUDGE0_BASE_URL = "https://judge0.skillment.in"

interface SubmissionRequest {
  source_code: string
  language_id: number
  stdin?: string | null
}

interface Judge0Submission {
  token: string
}

interface Judge0Result {
  status: {
    id: number
    description: string
  }
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  time: string | null
  memory: number | null
}

async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text()
  console.log("Raw response:", text.substring(0, 500)) // Log first 500 chars

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error("Failed to parse JSON:", error)
    console.error("Response text:", text)
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmissionRequest = await request.json()
    console.log("Submission request:", {
      language_id: body.language_id,
      code_length: body.source_code.length,
      has_stdin: !!body.stdin,
    })

    // Create submission with multiple retry attempts and better error handling
    let submissionResponse: Response
    let submissionAttempts = 0
    const maxSubmissionAttempts = 3

    do {
      try {
        console.log(`Submission attempt ${submissionAttempts + 1}`)

        submissionResponse = await fetch(`${JUDGE0_BASE_URL}/submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "CodeRunner/1.0",
          },
          body: JSON.stringify({
            source_code: body.source_code,
            language_id: body.language_id,
            stdin: body.stdin || "",
            wait: false, // Don't wait for execution to complete
          }),
          signal: AbortSignal.timeout(15000), // 15 second timeout
        })

        console.log("Submission response status:", submissionResponse.status)
        console.log("Submission response headers:", Object.fromEntries(submissionResponse.headers.entries()))

        if (submissionResponse.ok) {
          break // Success, exit retry loop
        } else {
          const errorText = await submissionResponse.text()
          console.error(`Submission attempt ${submissionAttempts + 1} failed:`, errorText)

          if (submissionAttempts === maxSubmissionAttempts - 1) {
            // Last attempt failed
            throw new Error(
              `All submission attempts failed. Status: ${submissionResponse.status}, Response: ${errorText}`,
            )
          }
        }
      } catch (fetchError) {
        console.error(`Submission attempt ${submissionAttempts + 1} error:`, fetchError)

        if (submissionAttempts === maxSubmissionAttempts - 1) {
          throw fetchError
        }
      }

      submissionAttempts++
      if (submissionAttempts < maxSubmissionAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    } while (submissionAttempts < maxSubmissionAttempts)

    const submission: Judge0Submission = await safeJsonParse(submissionResponse)
    console.log("Submission created:", submission)

    if (!submission.token) {
      throw new Error("No token received from submission")
    }

    // Poll for result with better error handling
    let result: Judge0Result
    let attempts = 0
    const maxAttempts = 30 // 30 seconds timeout

    do {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      console.log(`Polling attempt ${attempts + 1} for token: ${submission.token}`)

      const resultResponse = await fetch(`${JUDGE0_BASE_URL}/submissions/${submission.token}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("Result response status:", resultResponse.status)

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text()
        console.error("Result fetch failed:", errorText)
        throw new Error(`Failed to get result with status ${resultResponse.status}: ${errorText}`)
      }

      result = await safeJsonParse(resultResponse)
      console.log("Result status:", result.status)
      attempts++

      // Continue polling while status is "In Queue" (1) or "Processing" (2)
    } while ((result.status.id === 1 || result.status.id === 2) && attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      console.log("Execution timed out after", maxAttempts, "attempts")
      return NextResponse.json({
        status: { description: "Time Limit Exceeded" },
        stdout: null,
        stderr: "Execution timed out - the server took too long to respond",
        compile_output: null,
        time: null,
        memory: null,
      })
    }

    console.log("Final result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing code:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        status: { description: "Error" },
        stdout: null,
        stderr: `Execution failed: ${errorMessage}`,
        compile_output: null,
        time: null,
        memory: null,
      },
      { status: 500 },
    )
  }
}
