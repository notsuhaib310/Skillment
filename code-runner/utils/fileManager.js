import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const writeTempFiles = async (language, code, input, mainFileName) => {
  const dir = path.join(__dirname, '..', 'temp', uuidv4());
  await fs.ensureDir(dir);

  // For Java, ensure the class name matches the file name
  if (language === 'java') {
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    if (classNameMatch) {
      mainFileName = classNameMatch[1];
      // Ensure the code is in a file with the same name as the class
      const codeFile = path.join(dir, `${mainFileName}.java`);
      await fs.writeFile(codeFile, code);
      await fs.writeFile(path.join(dir, 'input.txt'), input || '');
      return { dir, codeFile, inputFile: path.join(dir, 'input.txt'), mainFileName };
    }
  }

  // For other languages or if no class name found
  const codeFile = path.join(dir, `${mainFileName}.${language === 'python' ? 'py' : 'java'}`);
  const inputFile = path.join(dir, 'input.txt');

  await fs.writeFile(codeFile, code);
  await fs.writeFile(inputFile, input || '');

  return { dir, codeFile, inputFile, mainFileName };
};

export const cleanUp = async (dir) => {
  try {
    await fs.remove(dir);
  } catch (error) {
    console.error('Error cleaning up:', error);
  }
};
