import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isUserOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 px-3 sm:px-6 py-3 shrink-0">
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isUserOnline ? "online" : "offline"}`}>
          <div className="w-10 sm:w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium ">
            {selectedUser.fullName}
          </h3>
          <p className="text-slate-400 text-sm">
            {isUserOnline? "online": "offline"}
          </p>
        </div>
      </div>
      <button
        onClick={() => setSelectedUser(null)}
        className="p-2 -mr-1 rounded-lg hover:bg-slate-700/50"
        aria-label="Back to chats"
      >
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}

export default ChatHeader;
