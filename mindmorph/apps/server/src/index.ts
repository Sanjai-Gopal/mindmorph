import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mindmorph-server" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  socket.emit("connected", { message: "Welcome to MindMorph realtime channel." });
});

const port = Number(process.env.PORT || 4000);
httpServer.listen(port, () => {
  console.log(`MindMorph server running on ${port}`);
});
