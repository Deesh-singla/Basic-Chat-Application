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
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
}

app.on("connection", (socket) => {
    socket.on("message", (msg) => {
        const parsedobj = JSON.parse(msg.toString());
        if(parsedobj.type=="connect"){
             socket.send(JSON.stringify({message:"connected"}));
        }
        if (parsedobj.type == "create_room") {
            let randomId = randomRoomId();
            rooms.set(randomId, [])
            socket.send(JSON.stringify({ message: "room-created", roomId: randomId }));
        }   
        if (parsedobj.type == "join_room") {
            const roomId = parsedobj.payload.roomId;
            const username = parsedobj.payload.username;
            if (rooms.get(roomId) == undefined) {
                socket.send(JSON.stringify({ type: "error", message: "Room Not available" }))
                return;
            }
            rooms.get(parsedobj.payload.roomId)?.push({ name: username, socket: socket })
            const currentUsers = rooms.get(roomId);
            const userCount = currentUsers?.length || 0;
            socketToRoom.set(socket, roomId);
            socket.send(JSON.stringify({ message: "user enter room successfully", usersConnected: userCount, roomId: roomId }));

            currentUsers?.forEach(user => {
                if (user.socket !== socket) {
                    user.socket.send(JSON.stringify({
                        type: "user-joined",
                        message: `${username} joined the room`,
                        usersConnected: userCount,
                        roomId: roomId
                    }));
                }
            });
        }
        if (parsedobj.type == "chat") {
            const a = rooms.get(parsedobj.payload.roomId)
            const username = parsedobj.payload.username;
            a?.map(s => s.socket.send(JSON.stringify({type:"chat",username:username,message:parsedobj.payload.message})))
        }
    })
    socket.on("close", () => {
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