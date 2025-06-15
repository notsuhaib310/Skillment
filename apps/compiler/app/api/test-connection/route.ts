import { NextResponse } from "next/server"

const JUDGE0_BASE_URL = "https://judge0.skillment.in"

export async function GET() {
  try {
    console.log("Testing connection to:", JUDGE0_BASE_URL)

    // First, try to test basic connectivity with a simple GET request
    let response: Response
    let testEndpoint = ""

    // Try different endpoints that Judge0 typically supports
    const testEndpoints = [
      "/about", // Basic info endpoint
      "/languages", // Languages endpoint
      "/system_info", // System info endpoint
      "/", // Root endpoint
    ]

    let lastError = ""
    let responseText = ""

    for (const endpoint of testEndpoints) {
      try {
        testEndpoint = endpoint
        console.log(`Trying endpoint: ${JUDGE0_BASE_URL}${endpoint}`)

        response = await fetch(`${JUDGE0_BASE_URL}${endpoint}`, {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "User-Agent": "CodeRunner/1.0",
          },
          // Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        console.log(`Response status for ${endpoint}:`, response.status)
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

        responseText = await response.text()
        console.log(`Response text (first 200 chars):`, responseText.substring(0, 200))

        if (response.ok) {
          // Try to parse as JSON, but don't fail if it's not JSON
          try {
            const jsonData = JSON.parse(responseText)
            return NextResponse.json({
              message: `✅ Successfully connected to Judge0 server via ${endpoint}`,
              status: response.status,
              endpoint: testEndpoint,
              data: jsonData,
            })
          } catch (jsonError) {
            // If it's not JSON but response is OK, that's still a successful connection
            return NextResponse.json({
              message: `✅ Connected to Judge0 server via ${endpoint} (non-JSON response)`,
              status: response.status,
              endpoint: testEndpoint,
              responseType: "text/html or plain text",
              preview: responseText.substring(0, 100),
            })
          }
        } else {
          lastError = `HTTP ${response.status}: ${responseText.substring(0, 100)}`
        }
      } catch (endpointError) {
        console.error(`Error testing ${endpoint}:`, endpointError)
        lastError = endpointError instanceof Error ? endpointError.message : "Unknown error"
        continue
      }
    }

    // If we get here, all endpoints failed
    return NextResponse.json(
      {
        error: `❌ All endpoints failed. Last error: ${lastError}`,
        testedEndpoints: testEndpoints,
        serverUrl: JUDGE0_BASE_URL,
        lastResponse: responseText.substring(0, 200),
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("Connection test error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: `❌ Connection failed: ${errorMessage}`,
        serverUrl: JUDGE0_BASE_URL,
        suggestion: "Check if the Judge0 server is running and accessible",
      },
      { status: 500 },
    )
  }
}
