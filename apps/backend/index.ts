import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
import roomRouter from "./routes/room";
import gameRouter from "./routes/game";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Healthy Server",
  });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/game", gameRouter);

app.listen(3001, () => {
  console.log("server is running on port 3001");
});
