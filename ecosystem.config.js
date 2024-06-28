module.exports = {
  apps: [
    {
      name: "eth",
      script: "./server.js",
      exec_mode: "cluster", // Chạy ứng dụng ở chế độ cluster
      instances: "max", // Tận dụng tối đa số lõi CPU có sẵn
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
