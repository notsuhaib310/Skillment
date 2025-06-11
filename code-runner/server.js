// server.js
import express from 'express';
import { runPython } from './runners/pythonRunner.js';
import { runJava } from './runners/javaRunner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
  console.log("[CORS] Request received:", req.method, req.url);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log("[CORS] Handling preflight request");
    return res.status(200).end();
  }
  
  next();
});

app.post('/run', async (req, res) => {
    console.log("[SERVER] Run request received");
    console.log("[SERVER] Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      const { language, code, input } = req.body;
      console.log("[SERVER] Language:", language);
      console.log("[SERVER] Code:", code);
      console.log("[SERVER] Input:", input);
  
      let output;
  
      if (language === 'python') {
        console.log("[SERVER] Running Python code");
        output = await runPython(code, input);
        console.log("[SERVER] Python output:", output);
      } else if (language === 'java') {
        console.log("[SERVER] Running Java code");
        output = await runJava(code, input);
        console.log("[SERVER] Java output:", output);
      } else {
        console.log("[SERVER] Unsupported language:", language);
        return res.status(400).json({ error: 'Unsupported language' });
      }
  
      // Ensure output is a string and not empty
      if (!output) {
        console.log("[SERVER] No output received, using default message");
        output = "Program executed successfully (no output)";
      } else {
        output = String(output).trim();
        console.log("[SERVER] Final output:", output);
      }
  
      console.log("[SERVER] Sending response");
      res.json({ output });
      console.log("[SERVER] Response sent");
    } catch (err) {
      console.error("[SERVER] Error occurred:", err);
      console.error("[SERVER] Error stack:", err.stack);
      res.status(500).json({ error: 'Internal Server Error', detail: err.message });
    }
  });
  
app.listen(5000, () => {
  console.log("[SERVER] Code runner API listening on port 5000");
  console.log("[SERVER] Server started successfully");
});
