module.exports = {
  apps: [
    {
      name: "biodata99",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/biodata99/current",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
    },
  ],
};
