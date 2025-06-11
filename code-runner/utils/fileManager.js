import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const writeTempFiles = async (language, code, input, mainFileName) => {
  const dir = path.join(__dirname, '..', 'temp', uuidv4());
  await fs.ensureDir(dir);

  const codeFile = path.join(dir, `${mainFileName}.${language === 'python' ? 'py' : 'java'}`);
  const inputFile = path.join(dir, 'input.txt');

  await fs.writeFile(codeFile, code);
  await fs.writeFile(inputFile, input || '');

  return { dir, codeFile, inputFile };
};

export const cleanUp = async (dir) => {
  try {
    await fs.remove(dir);
  } catch (error) {
    console.error('Error cleaning up:', error);
  }
};
