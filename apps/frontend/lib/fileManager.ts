import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { v4 as uuidv4 } from "uuid"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "..", "..", "temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

export interface TempFiles {
  dir: string
  codeFile: string
  inputFile: string
}

export async function writeTempFiles(
  language: string,
  code: string,
  input: string,
  baseName: string
): Promise<TempFiles> {
  const sessionId = uuidv4()
  const dir = path.join(tempDir, sessionId)
  
  try {
    fs.mkdirSync(dir, { recursive: true })

    let codeFile: string
    let inputFile: string

    switch (language.toLowerCase()) {
      case "python":
        codeFile = path.join(dir, `${baseName}.py`)
        break
      case "java":
        codeFile = path.join(dir, `${baseName}.java`)
        break
      default:
        throw new Error(`Unsupported language: ${language}`)
    }

    inputFile = path.join(dir, "input.txt")

    // Write code to file
    fs.writeFileSync(codeFile, code)

    // Write input to file if provided
    if (input) {
      fs.writeFileSync(inputFile, input)
    }

    return { dir, codeFile, inputFile }
  } catch (error) {
    // Clean up on error
    await cleanUp(dir)
    throw error
  }
}

export async function cleanUp(dir: string): Promise<void> {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  } catch (error) {
    console.error(`Error cleaning up directory ${dir}:`, error)
    throw error
  }
} 