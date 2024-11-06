// client.js
import { io } from "socket.io-client";
const socket = io("http://localhost:10000");

socket.on("connect", () => {
  console.log("Đã kết nối tới server");

  // Gửi tin nhắn tới server
  socket.emit("connected", "tung@gmail.com");
});

socket.on("connected", (msg) => {
  console.log("Nhận tin nhắn từ server:", msg);
});

socket.on("disconnect", () => {
  console.log("Đã ngắt kết nối từ server");
});