import { writeTempFiles, cleanUp } from "../utils/fileManager.js";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runJava = (code, input) => {
  return new Promise(async (resolve, reject) => {
    const { dir, codeFile, inputFile } = await writeTempFiles("java", code, input, "Main");

    const cmd = `docker build -f docker/java.Dockerfile -t java-runner ${dir} && docker run --rm -v ${dir}:/app java-runner`;

    exec(cmd, { timeout: 15000 }, async (err, stdout, stderr) => {
      await cleanUp(dir);

      if (err) return reject(stderr || err.message);
      return resolve(stdout);
    });
  });
};
