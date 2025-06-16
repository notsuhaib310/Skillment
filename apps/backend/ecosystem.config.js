// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "skillment-backend",
      script: "dist/index.js",
      instances: 1, // or "max" for multi-core
      exec_mode: "fork", // or "cluster" if stateless
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        
      }
    }
  ]
};
