// client.js
import { io } from "socket.io-client";
const socket = io("https://quizmath.onrender.com");

socket.on("connect", () => {
  console.log("Đã kết nối tới server");

  // Gửi tin nhắn tới server
  socket.emit("message", "Hello từ client!");
  socket.emit("message", "Hello tungtt!");
  socket.emit("message", "Hello tungtt!");
  socket.emit("message", "Hello test!");
});

socket.on("message", (msg) => {
  console.log("Nhận tin nhắn từ server:", msg);
});

socket.on("disconnect", () => {
  console.log("Đã ngắt kết nối từ server");
});