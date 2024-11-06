import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

var users = {};

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
      console.log("Server socket is starting.....")
      socket.on("connected", email => {
        users[email] = socket;
        console.log("connected " + email)
      })
      /* Nhận request Rent từ user => chuyển cho player */
      socket.on("send-request", function (jsonData) {
          console.log(jsonData);
          // io.sockets.emit("send-request", jsonData);
          // socket.broadcast.emit('receive-request', jsonData);
          let receiverEmail = jsonData['ReceiverEmail'];
          let message = jsonData['message']; //message{'Email':'diepgiahan@gmail.com','DisplayName':'Diep Gia Han','TimeToRent':4,'TotalMoney':'350000','message':'choi voi minh nha ban'}
          let receiverSocket = users[receiverEmail];
          if (receiverSocket)
              receiverSocket.emit('receive-request', message)
          else
              socket.emit('receive-request', { "isLogOut": "Player " + PlayerName + " đã không còn sẵn sàng để thuê/ hoặc không còn online." })
      });
      /* Nhận thông báo close */
      socket.on("manual-disconnection", function (email) {
          delete users[email];
      });
      /* Nhận response => Trả lời request rent cho user */
      socket.on("response-receive", function (jsonData) {
          let emailResponse = jsonData['email-response'];
          receiverSocket = users[emailResponse];
          if (receiverSocket)
              receiverSocket.emit('waiting-response', jsonData);
      });

      /* Nhận finish rent từ user => đẩy qua player để update tiền */
      socket.on("finish-rent", function (data) {
          let playerSocket = users[data['Player']];
          if (playerSocket) {
              playerSocket.emit('finish-rent', data);
          }
      })
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
