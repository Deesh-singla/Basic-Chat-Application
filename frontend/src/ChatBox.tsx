import { useEffect, useRef } from "react";

interface ChatInterface {
    type: string;
    message: string;
    username: string;
}

interface chatBoxProps {
    roomId: string | null;
    connectedUsers: number | null;
    userJoined: string | null;
    setUserJoined: (x: string | null) => void;
    socket: WebSocket | null;
    username: string;
    chat: ChatInterface[];
}
export default function ChatBox({ roomId, connectedUsers, userJoined, setUserJoined, socket, username, chat }: chatBoxProps) {
    console.log(chat);
    const msgRef = useRef<HTMLInputElement | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
    useEffect(() => {
        if (userJoined) {
            const timer = setTimeout(() => {
                setUserJoined(null);
            }, 3000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [userJoined, setUserJoined]);

    function handleSend() {
        const message = msgRef.current?.value;
        socket?.send(JSON.stringify({ type: "chat", payload: { username, roomId, message } }))
        msgRef.current!.value="";
    }

    function handleKeyDown(e:React.KeyboardEvent<HTMLInputElement>){
        if(e.key==="Enter") handleSend();
    }
    return (
        <div className="h-[90%] w-[90%] max-w-md border border-solid border-white/20 rounded-lg text-white p-5 flex flex-col bg-[#101010]/70 ">
            <div>
                <h1 className="text-2xl ">Real time chat</h1>
                <p className="text-white/50 mt-2">temporary room that expires after all users exits</p>
            </div>
            <div className="border border-transparent rounded-md bg-[#272628] mt-3 p-2 flex justify-between text-white/70">
                <p>Room Code: {roomId}</p>
                <p>Users: {connectedUsers}</p>
            </div>
            <div className="relative border border-solid border-white/20 rounded-md flex-1 overflow-y-auto my-2 scrollbar-hide">
                {userJoined && <p className="absolute w-full bg-white text-black px-4 py-2">{userJoined}</p>}
                {chat &&
                    chat.map((x, i) => (
                        <div key={i} className={`m-2 flex ${x.username == username ? "justify-end" : "justify-start"}`}>
                            <div className={`inline-block p-2 rounded-md max-w-xs break-words
                                ${x.username == username ? "bg-white text-black" : "bg-[#1c1c1c] text-white/80"}`}>
                                <div className="text-xs font-semibold">{x.username}</div>
                                <div>{x.message}</div>
                            </div>
                        </div>
                    ))
                }
                <div ref={chatEndRef}></div>
            </div>
            <div className="flex items-center gap-2">
                <input type="text" className="flex-1 bg-[#272628] text-white rounded-md px-3 py-2 outline-none" placeholder="Type a message..." ref={msgRef} onKeyDown={(e)=>handleKeyDown(e)}/>
                <button className="bg-white text-black px-4 py-2 rounded-md" onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}
