// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { runPythonInteractive } from './runners/pythonRunner.js';
import { runJavaInteractive } from './runners/javaRunner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

// Basic CORS setup for HTTP requests (though Socket.IO handles its own CORS)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Remove the old /run POST endpoint, as we're now using WebSockets
// app.post('/run', ...);

io.on('connection', (socket) => {
  console.log(`[SERVER] User connected: ${socket.id}`);

  socket.on('run_code', async ({ language, code, input }) => {
    console.log(`[SERVER] Received run_code request from ${socket.id} for ${language}`);
    console.log("[SERVER] Code (first 100 chars):", code.substring(0, 100));
    console.log("[SERVER] Initial Input:", input);

    // Clear previous output for this session
    socket.emit('output', { type: 'clear' });

    try {
      if (language === 'python') {
        await runPythonInteractive(socket, code, input);
      } else if (language === 'java') {
        await runJavaInteractive(socket, code, input);
      } else {
        socket.emit('output', { type: 'error', data: 'Unsupported language' });
        socket.emit('execution_end');
      }
    } catch (err) {
      console.error("[SERVER] Error during code execution:", err);
      socket.emit('output', { type: 'error', data: `Server error: ${err.message || err}` });
      socket.emit('execution_end');
    }
  });

  socket.on('input', ({ data }) => {
    // This will be handled by the runners, which will pipe to child_process stdin
    console.log(`[SERVER] Received input from ${socket.id}: ${data.trim()}`);
  });

  socket.on('disconnect', () => {
    console.log(`[SERVER] User disconnected: ${socket.id}`);
  });
});

httpServer.listen(5000, () => {
  console.log("[SERVER] Code runner API listening on port 5000 (HTTP and WebSocket)");
});
