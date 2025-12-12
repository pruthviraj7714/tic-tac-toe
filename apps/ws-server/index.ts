import { verify, type JwtPayload } from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { JWT_SECRET } from "./config";

const wss = new WebSocketServer({ port: 8080 });

function authenticate(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url?.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Token not found!",
      })
    );
    return ws.close();
  }

  const userId = authenticate(token);

  if (!userId) {
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "user Id not found!",
      })
    );
    return ws.close();
  }

  ws.on("message", async (data) => {
    let payload;
    try {
      payload = JSON.parse(data.toString());
    } catch (error) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Invalid JSON payload" })
      );
    }

    switch (payload.type) {
      case "room:join": {
        //join room handler
        break;
      }
      case "room:leave": {
        //leave room handler
        break;
      }
      case "room:start_game": {
        //start game handler
        break;
      }
      case "game:move": {
        //move handler
        break;
      }
      case "game:rematch_request": {
        //rematch nandler
        break;
      }
      case "game:rematch_accept": {
        //rematch accept handler
        break;
      }
      case "spectator:join": {
        //spectator join handler
        break;
      }
      case "spectator:leave": {
        //spectator leave handler
        break;
      }
    }
  });

  ws.on("ping", () => {
    ws.pong();
  });

  ws.on("close", () => {
    console.log(`User disconnected: ${userId}`);
  });

  ws.on("error", (err) => console.error("WS error:", err.stack));
});

console.log("websocket server is running on port 8080");
