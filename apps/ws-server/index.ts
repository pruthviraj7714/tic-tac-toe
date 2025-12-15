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

type UserId = string;
type RoomId = string;
type Cell = "X" | "O" | "-";
type GameStatus = "waiting" | "in-progress" | "finished";

interface IUser {
  id: string;
}

type ISpectator = IUser;

type IPlayer = IUser;

interface IGame {
  currTurn: "X" | "O";
  seats: {
    x: UserId;
    o: UserId;
  };
  board: [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
  winner: null | IPlayer;
  status: GameStatus;
}

interface IRoom {
  roomId: string;
  players: IPlayer[];
  spectators: ISpectator[];
  games: IGame[];
}

const rooms = new Map<string, IRoom>();

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url?.split("?")[1]);
  const token = params.get("token");
  const roomId = params.get("roomId");

  if (!token) {
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Token not found!",
      })
    );
    return ws.close();
  }

  if (!roomId) {
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Room Id is missing!",
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

  let room: IRoom;

  room = rooms.get(roomId) as IRoom;

  if (!room) {
    room = {
      games: [],
      players: [],
      roomId,
      spectators: [],
    };
    rooms.set(roomId, room);
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
        const players = room.players;
        if (players.length >= 2) {
          return ws.send(
            JSON.stringify({ type: "ERROR", message: "Room is Full" })
          );
        }

        let newPlayer: IPlayer = {
          id: userId,
        };

        room = {
          ...room,
          players: [...room.players, newPlayer],
        };
        rooms.set(roomId, room);
        break;
      }
      case "room:leave": {
        const players = room.players;
        if (players.length === 0) {
          return ws.send(
            JSON.stringify({ type: "ERROR", message: "Room is Already Empty" })
          );
        }

        room = {
          ...room,
          players: room.players.filter((player) => player.id !== userId),
        };
        rooms.set(roomId, room);
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
