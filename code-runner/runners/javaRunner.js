import { writeTempFiles, cleanUp } from "../utils/fileManager.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runJavaInteractive = (socket, code, initialInput) => {
  return new Promise(async (resolve, reject) => {
    const { dir, codeFile, inputFile } = await writeTempFiles("java", code, initialInput, "Main");

    const dockerBuildCmd = `docker build -f docker/java.Dockerfile -t java-runner ${dir}`;

    try {
      // Build the Docker image first
      const buildProcess = spawn(dockerBuildCmd, { shell: true, cwd: dir });

      buildProcess.stderr.on('data', (data) => {
        socket.emit('output', { type: 'error', data: `[DOCKER BUILD ERROR]: ${data.toString()}` });
      });

      buildProcess.on('close', async (code) => {
        if (code !== 0) {
          const error = `Docker build failed with exit code ${code}`;
          socket.emit('output', { type: 'error', data: error });
          socket.emit('execution_end');
          await cleanUp(dir);
          return reject(new Error(error));
        }

        // Once build is successful, run the container
        const dockerRunCmd = `docker run --rm -v ${dir}:/app java-runner`;
        const childProcess = spawn(dockerRunCmd, { shell: true });

        // Pipe initial input to stdin
        if (initialInput) {
          childProcess.stdin.write(initialInput + '\n');
        }

        // Handle stdout (program output)
        childProcess.stdout.on('data', (data) => {
          socket.emit('output', { type: 'stdout', data: data.toString() });
        });

        // Handle stderr (program errors)
        childProcess.stderr.on('data', (data) => {
          socket.emit('output', { type: 'stderr', data: data.toString() });
        });

        // Handle client input via WebSocket
        const onClientInput = ({ data }) => {
          childProcess.stdin.write(data + '\n');
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
