import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
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