import { toast } from "sonner"

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

interface MCQQuestion {
  question: string
  options: { text: string; isCorrect: boolean }[]
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
}

interface CodingQuestion {
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  starterCode: { [language: string]: string }
  testCases: {
    input: string
    expectedOutput: string
    isPublic: boolean
    explanation?: string
  }[]
}

interface QuestionGenerationRequest {
  type: "mcq" | "coding"
  topic: string
  difficulty: "easy" | "medium" | "hard"
  count?: number
  language?: string // For coding questions
  additionalRequirements?: string
}

export class AIQuestionGenerator {
  private apiKey: string

  constructor() {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.")
    }
    this.apiKey = OPENAI_API_KEY
  }

  async generateMCQQuestions(request: QuestionGenerationRequest): Promise<MCQQuestion[]> {
    try {
      const prompt = this.buildMCQPrompt(request)
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert assessment creator. Generate high-quality multiple choice questions with detailed explanations. Always respond with valid JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content received from OpenAI")
      }

      // Clean and parse the JSON response
      const cleanedContent = this.cleanJSONResponse(content)
      const questions = JSON.parse(cleanedContent)
      return Array.isArray(questions) ? questions : [questions]
    } catch (error) {
      console.error("Error generating MCQ questions:", error)
      toast.error("Failed to generate questions. Please try again.")
      throw error
    }
  }

  async generateCodingQuestions(request: QuestionGenerationRequest): Promise<CodingQuestion[]> {
    try {
      const prompt = this.buildCodingPrompt(request)
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert programming instructor. Generate coding problems with detailed descriptions, starter code, and comprehensive test cases. Always respond with valid JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content received from OpenAI")
      }

      // Clean and parse the JSON response
      const cleanedContent = this.cleanJSONResponse(content)
      const questions = JSON.parse(cleanedContent)
      return Array.isArray(questions) ? questions : [questions]
    } catch (error) {
      console.error("Error generating coding questions:", error)
      toast.error("Failed to generate coding questions. Please try again.")
      throw error
    }
  }

  async generateTestCases(problemDescription: string, language: string = "javascript"): Promise<any[]> {
    try {
      const prompt = `Generate comprehensive test cases for this coding problem:

Problem: ${problemDescription}
Language: ${language}

Generate 6-8 test cases including:
- 2-3 basic examples (public)
- 2-3 edge cases (private)
- 2-3 complex scenarios (private)

Return as JSON array with this structure:
[
  {
    "input": "input data as string",
    "expectedOutput": "expected output as string",
    "isPublic": true/false,
    "explanation": "brief explanation of this test case"
  }
]`

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert at creating comprehensive test cases for coding problems. Always respond with valid JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content received from OpenAI")
      }

      return JSON.parse(this.cleanJSONResponse(content))
    } catch (error) {
      console.error("Error generating test cases:", error)
      toast.error("Failed to generate test cases. Please try again.")
      throw error
    }
  }

  async enhanceQuestionWithAI(question: string, type: "explanation" | "hints" | "difficulty"): Promise<string> {
    try {
      let prompt = ""
      
      switch (type) {
        case "explanation":
          prompt = `Provide a clear, detailed explanation for this question: ${question}`
          break
        case "hints":
          prompt = `Generate 2-3 helpful hints for solving this question: ${question}`
          break
        case "difficulty":
          prompt = `Analyze the difficulty level of this question and explain why: ${question}`
          break
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert educator. Provide clear, helpful responses."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ""
    } catch (error) {
      console.error("Error enhancing question:", error)
      toast.error("Failed to enhance question. Please try again.")
      throw error
    }
  }

  private cleanJSONResponse(content: string): string {
    // Remove markdown code blocks and trim whitespace
    let cleaned = content.trim()
    
    // Remove ```json and ``` markers
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7)
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3)
    }
    
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3)
    }
    
    return cleaned.trim()
  }

  private buildMCQPrompt(request: QuestionGenerationRequest): string {
    return `Generate ${request.count || 1} multiple choice question(s) about ${request.topic} at ${request.difficulty} difficulty level.

${request.additionalRequirements ? `Additional requirements: ${request.additionalRequirements}` : ''}

Return as JSON array with this exact structure:
[
  {
    "question": "Clear, well-formatted question text",
    "options": [
      {"text": "Option A text", "isCorrect": false},
      {"text": "Option B text", "isCorrect": true},
      {"text": "Option C text", "isCorrect": false},
      {"text": "Option D text", "isCorrect": false}
    ],
    "explanation": "Detailed explanation of why the correct answer is correct",
    "difficulty": "${request.difficulty}",
    "tags": ["relevant", "topic", "tags"]
  }
]

Guidelines:
- Questions should be clear and unambiguous
- Include 4 plausible options with only 1 correct answer
- Explanations should be educational and detailed
- Avoid trick questions
- Make sure incorrect options are plausible but clearly wrong`
  }

  private buildCodingPrompt(request: QuestionGenerationRequest): string {
    return `Generate ${request.count || 1} coding problem(s) about ${request.topic} at ${request.difficulty} difficulty level.
${request.language ? `Primary language: ${request.language}` : 'Language: JavaScript'}

${request.additionalRequirements ? `Additional requirements: ${request.additionalRequirements}` : ''}

Return as JSON array with this exact structure:
[
  {
    "title": "Clear, concise problem title",
    "description": "Detailed problem description with examples, constraints, and expected behavior",
    "difficulty": "${request.difficulty}",
    "tags": ["relevant", "algorithm", "tags"],
    "starterCode": {
      "${request.language || 'javascript'}": "function template or skeleton code"
    },
    "testCases": [
      {
        "input": "sample input as string",
        "expectedOutput": "expected output as string", 
        "isPublic": true,
        "explanation": "explanation of this test case"
      }
    ]
  }
]

Guidelines:
- Problems should be well-defined with clear requirements
- Include examples in the description
- Provide starter code that helps candidates get started
- Include at least 3-4 test cases (mix of public and private)
- Ensure problems are solvable within reasonable time limits`
  }
}

// Export singleton instance
export const aiQuestionGenerator = new AIQuestionGenerator() 