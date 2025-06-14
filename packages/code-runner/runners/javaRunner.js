import { writeTempFiles, cleanUp } from "../utils/fileManager.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runJavaInteractive = (socket, code, initialInput) => {
  return new Promise(async (resolve, reject) => {
    const { dir, codeFile, inputFile, mainFileName } = await writeTempFiles("java", code, initialInput, "Main");

    // Debug: List files in the directory
    const files = await fs.readdir(dir);
    console.log('[JAVA RUNNER] Files in temp directory:', files);

    // Use absolute paths for Docker commands
    const dockerfilePath = path.join(__dirname, '..', 'docker', 'java.Dockerfile');
    const dockerBuildCmd = `docker build -f "${dockerfilePath}" -t java-runner "${dir}"`;
    const dockerRunCmd = `docker run --rm -i -v "${dir}:/app" java-runner "${mainFileName}"`;

    try {
      // Build the Docker image first using powershell.exe
      const buildProcess = spawn('powershell.exe', ['-Command', dockerBuildCmd], { cwd: dir });

      buildProcess.stderr.on('data', (data) => {
        // Only emit actual errors, not Docker build progress
        const errorMsg = data.toString();
        if (errorMsg.includes('ERROR') && !errorMsg.includes('[DOCKER BUILD ERROR]')) {
          socket.emit('output', { type: 'error', data: errorMsg });
        }
      });

      buildProcess.on('close', async (code) => {
        if (code !== 0) {
          const error = `Docker build failed with exit code ${code}`;
          socket.emit('output', { type: 'error', data: error });
          socket.emit('execution_end');
          await cleanUp(dir);
          return reject(new Error(error));
        }

        // Debug: List files in the container
        const listFilesCmd = `docker run --rm -v "${dir}:/app" java-runner ls -la /app`;
        const listFilesProcess = spawn('powershell.exe', ['-Command', listFilesCmd]);
        listFilesProcess.stdout.on('data', (data) => {
          console.log('[JAVA RUNNER] Files in container:', data.toString());
        });

        // Once build is successful, run the container using powershell.exe
        const childProcess = spawn('powershell.exe', ['-Command', dockerRunCmd], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle stdout (program output)
        childProcess.stdout.on('data', (data) => {
          const output = data.toString();
          // Only emit non-empty output
          if (output.trim()) {
            // Check if the output contains an input prompt
            if (output.includes('?') || output.includes(':')) {
              socket.emit('output', { type: 'prompt', data: output });
            } else {
              socket.emit('output', { type: 'stdout', data: output });
            }
          }
        });

        // Handle stderr (program errors)
        childProcess.stderr.on('data', (data) => {
          const error = data.toString();
          // Only emit non-empty errors
          if (error.trim()) {
            socket.emit('output', { type: 'stderr', data: error });
          }
        });

        // Handle client input via WebSocket
        const onClientInput = ({ data }) => {
          if (childProcess.stdin.writable) {
            childProcess.stdin.write(data + '\n');
          }
        };
        socket.on('input', onClientInput);

        // Handle process exit
        childProcess.on('close', async (exitCode) => {
          console.log(`[JAVA RUNNER] Process exited with code ${exitCode}`);
          socket.off('input', onClientInput); // Remove listener to prevent memory leaks
          socket.emit('execution_end', { exitCode });
          await cleanUp(dir);
          resolve();
        });

        childProcess.on('error', (err) => {
          console.error(`[JAVA RUNNER] Child process error: ${err.message}`);
          socket.off('input', onClientInput);
          socket.emit('output', { type: 'error', data: `Execution error: ${err.message}` });
          socket.emit('execution_end');
          cleanUp(dir).finally(() => reject(err));
        });
      });

    } catch (error) {
      console.error("[JAVA RUNNER] Error before spawn:", error);
      socket.emit('output', { type: 'error', data: `Runner setup error: ${error.message}` });
      socket.emit('execution_end');
      cleanUp(dir).finally(() => reject(error));
    }
  });
};
