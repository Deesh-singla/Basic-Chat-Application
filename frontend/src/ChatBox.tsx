
export default function ChatBox() {
    return (
        <div className="h-[90%] w-[40%] border border-solid border-white/20 rounded-lg text-white p-5 flex flex-col">
            <div>
                <h1 className="text-2xl ">Real time chat</h1>
                <p className="text-white/50 mt-2">temporary room that expires after both user exits</p>
            </div>
            <div className="border border-transparent rounded-md bg-[#272628] mt-3 p-2 flex justify-between text-white/70">
                <p>Room Code:</p>
                <p>Users:</p>
            </div>
            <div className="border border-solid border-white/20 rounded-md flex-1 overflow-y-auto my-2"></div>
            <div className="flex items-center gap-2">
                <input type="text" className="flex-1 bg-[#272628] text-white rounded-md px-3 py-2 outline-none" placeholder="Type a message..." />
                <button className="bg-white text-black px-4 py-2 rounded-md">Send</button>
            </div>
        </div>
    )
}
