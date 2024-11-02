import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);
await client.connect();
console.log("Đã kết nối tới MongoDB");
const db = client.db("mydatabase");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 10000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
      console.log("Client đã kết nối");

      // Xử lý các sự kiện từ client
      socket.on("message", (msg) => {
        console.log("Nhận tin nhắn:", msg);
        io.emit("message", msg); // Phát lại tin nhắn cho các client khác
      });

      socket.on("disconnect", () => {
        console.log("Client đã ngắt kết nối");
      });
    });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
