import { WebSocketServer, WebSocket } from "ws";

const app = new WebSocketServer({ port: 8080 });
interface User {
    socket: WebSocket;
    name: string;
}
const rooms: Map<string, User[]> = new Map();
const socketToRoom: Map<WebSocket, string> = new Map();

function randomRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = ' ';
    for (let i = 0; i < 5; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
}

app.on("connection", (socket) => {
    socket.on("message", (msg) => {
        const parsedobj = JSON.parse(msg.toString());
        if (parsedobj.type == "create_room") {
            let randomId = randomRoomId();
            rooms.set(randomId, [])
            console.log(rooms)
            socket.send(JSON.stringify({ message: "room-created", roomId: randomId }));
        }
        if (parsedobj.type == "join_room") {
            rooms.get(parsedobj.payload.roomId)?.push({ name: parsedobj.payload.username, socket: socket })
            socketToRoom.set(socket, parsedobj.payload.roomId);
            socket.send(JSON.stringify({ message: "user enter room successfully", usersConnected: rooms.get(parsedobj.payload.roomId)?.length }));
        }
        if (parsedobj.type == "chat") {
            const a = rooms.get(parsedobj.payload.roomId)
            a?.map(s => s.socket.send(parsedobj.payload.message))
        }
    })
    socket.on("close", () => {
        console.log(rooms)
        const roomId = socketToRoom.get(socket);
        if (!roomId) return;

        const users = rooms.get(roomId);

        const filteredUsers = users?.filter(x => x.socket != socket);
        rooms.set(roomId, filteredUsers!)

        if (filteredUsers?.length === 0) {
            rooms.delete(roomId);
        }

        filteredUsers?.forEach(u => {
            u.socket.send(JSON.stringify({ type: "user-left", message: `A user has left the room `, usersConnected: filteredUsers.length }));
        });
    })
})