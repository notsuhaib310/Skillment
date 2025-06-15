export interface Language {
  id: number
  name: string
  monacoLanguage: string
  defaultCode: string
}

export interface SubmissionResult {
  status: {
    description: string
  }
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  time: string | null
  memory: number | null
}

export interface TestCase {
  id: number
  input: string
  output: string
  isActive: boolean
}

export interface Problem {
  id: number
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints: string[]
  topics: string[]
  followUp?: string
}
