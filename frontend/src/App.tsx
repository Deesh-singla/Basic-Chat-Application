import { useEffect, useRef, useState } from "react";
import ChatBox from "./ChatBox";

export default function App() {
  interface ChatInterface {
    type: string;
    message: string;
    username: string;
  }
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [newRoomId, setNewRoomId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [userJoined, setUserJoined] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<number | null>(null)
  const [username, setUsername] = useState<string>("");
  const [chat, setChat] = useState<ChatInterface[]>([]);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const roomIdRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("https://basic-chat-application-mntf.onrender.com");
     ws.onopen = () => {
    ws.send(JSON.stringify({ type: "connect" })); 
  };
    setLoading(true);
    ws.onmessage = (msg) => {
      const parsedObj = JSON.parse(msg.data.toString());
      // console.log(parsedObj);
      if (parsedObj.message === "connected") setLoading(false);
      if (parsedObj.roomId) {
        setNewRoomId(parsedObj.roomId);
      }

      if (parsedObj.message == "user enter room successfully") {
        // console.log(parsedObj);
        setNewRoomId(parsedObj.roomId);
        setConnectedUsers(parsedObj.usersConnected)
        setShowChat(true);
      }

      if (parsedObj.type == "user-joined") {
        // console.log("New user joined:", parsedObj);
        setConnectedUsers(parsedObj.usersConnected);
        setUserJoined(parsedObj.message);
      }

      if (parsedObj.type == "user-left") {
        console.log("User left:", parsedObj);
        // console.log(parsedObj.message);
        setConnectedUsers(parsedObj.usersConnected);
        setUserJoined(parsedObj.message);
      }

      if (parsedObj.type === "error") {
        setErrorMsg(parsedObj.message);
      }

      if (parsedObj.type == "chat") {
        console.log(parsedObj)
        setChat(prev => [...prev, parsedObj])
      }

      return () => {
        ws.close();
      };
    };
    setSocket(ws);
  }, []);

  function createRoom() {
    setShowForm(false);
    socket?.send(JSON.stringify({ type: "create_room" }));
  }

  function handleJoinRoomBtn() {
    const obj = {
      type: "join_room",
      payload: {
        roomId: roomIdRef.current?.value,
        username: usernameRef.current?.value
      }
    }
    if (usernameRef.current?.value) setUsername(usernameRef.current?.value);
    socket?.send(JSON.stringify(obj))
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex justify-center items-center">
      {loading ? <h1>Loading...</h1> :
         showChat?<ChatBox roomId = { newRoomId } connectedUsers = { connectedUsers } userJoined = { userJoined } setUserJoined = { setUserJoined } socket = { socket } username = { username } chat = { chat } /> :
      <div className="h-[62%] w-[90%] max-w-md border border-white/20 rounded-2xl text-white p-6 flex flex-col shadow-2xl bg-[#101010]/70 ">
        <div>
          <h1 className="text-3xl font-semibold">💬 Real-time Chat</h1>
          <p className="text-white/60 mt-2 text-sm">
            Temporary room that expires after both users exit.
          </p>
        </div>

        <div className="flex justify-around mt-6 text-center gap-4">
          <button
            className="bg-white text-black w-full py-2 rounded-lg font-medium hover:bg-gray-200 "
            onClick={createRoom}
          >
            Create Room
          </button>
          <button
            className="bg-white text-black w-full py-2 rounded-lg font-medium hover:bg-gray-200 "
            onClick={() => {
              setShowForm(true);
              setNewRoomId(null);
            }}
          >
            Join Room
          </button>
        </div>

        {newRoomId && (
          <div className="bg-[#1c1c1c] mt-6 text-center text-white/80 text-lg p-3 rounded-md border border-white/10">
            Room ID: <span className="font-mono">{newRoomId}</span>
          </div>
        )}

        {showForm && (
          <div className="flex flex-col gap-3 mt-6 w-full">
            <input
              type="text"
              className="bg-[#272628] text-white rounded-md px-4 py-3 outline-none w-full placeholder-white/50 focus:ring-2 ring-white/20"
              placeholder="Type Username..."
              ref={usernameRef}
            />
            <input
              type="text"
              className="bg-[#272628] text-white rounded-md px-4 py-3 outline-none w-full placeholder-white/50 focus:ring-2 ring-white/20"
              placeholder="Type Room ID..."
              ref={roomIdRef}
            />
            <button
              className="bg-white text-black px-4 py-3 rounded-md w-full font-medium hover:bg-gray-200 transition-all"
              onClick={handleJoinRoomBtn}
            >
              Join
            </button>
            {errorMsg && <p className="text-red-600 pt-2 text-center">{errorMsg}</p>}
          </div>
        )}
      </div>
      }
    </div>
  );
}
