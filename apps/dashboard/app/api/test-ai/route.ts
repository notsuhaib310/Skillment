import { NextResponse } from "next/server"
import { aiQuestionGenerator } from "@/lib/ai-question-generator"

export async function POST(request: Request) {
  try {
    const questions = await aiQuestionGenerator.generateMCQQuestions({
      type: "mcq",
      topic: "JavaScript Basics",
      difficulty: "easy",
      count: 2,
      additionalRequirements: "Focus on fundamental concepts like variables, data types, and functions"
    })

    return NextResponse.json({ success: true, questions })
  } catch (error) {
    console.error("Error in test-ai route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    )
  }
} 