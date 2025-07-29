import { useEffect, useRef, useState } from "react";

export default function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [newRoomId, setNewRoomId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const usernameRef=useRef<HTMLInputElement |null>(null);
  const roomIdRef=useRef<HTMLInputElement |null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (msg) => {
      const parsedObj = JSON.parse(msg.data.toString());
      console.log(parsedObj);
      if (parsedObj.roomId) {
        setNewRoomId(parsedObj.roomId);
      }
    };
    setSocket(ws);
  }, []);

  function createRoom() {
    setShowForm(false);
    socket?.send(JSON.stringify({ type: "create_room" }));
  }

  function handleJoinRoomBtn() {
    // socket?.send(JSON.stringify({ type: "join_room", roomId, username }))
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex justify-center items-center">
      <div className="h-[60%] w-[90%] max-w-md border border-white/20 rounded-2xl text-white p-6 flex flex-col shadow-2xl bg-[#101010]/70 backdrop-blur-sm">
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
          </div>
        )}
      </div>
    </div>
  );
}
