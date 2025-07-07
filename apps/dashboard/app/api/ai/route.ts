import { AzureOpenAI } from "openai"
import { NextResponse } from "next/server"

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION

const client = new AzureOpenAI({
  apiKey: AZURE_OPENAI_API_KEY,
  endpoint: AZURE_OPENAI_ENDPOINT,
  deployment: AZURE_OPENAI_DEPLOYMENT,
  apiVersion: AZURE_OPENAI_API_VERSION,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, prompt, systemMessage, temperature = 0.7, maxTokens = 2000 } = body

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      model: AZURE_OPENAI_DEPLOYMENT || "",
    })

    return NextResponse.json({ 
      success: true, 
      content: response.choices[0]?.message?.content 
    })
  } catch (error) {
    console.error("Error in AI route:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    )
  }
} 