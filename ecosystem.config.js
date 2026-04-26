module.exports = {
  apps: [
    {
      name: "movie-buddy",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4173,
        HOST: "127.0.0.1",
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      max_memory_restart: "512M",
      restart_delay: 2000,
      watch: false,
    },
    {
      name: "movie-buddy-reminders",
      script: "./worker-reminders.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/reminders-error.log",
      out_file: "./logs/reminders-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      cron_restart: "0 4 * * *",
      watch: false,
    },
  ],
};
