import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import ProfilePictureViewer from "./ProfilePictureViewer";

function ChatsList() {
  const { getAllChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllChatPartners();
  }, [getAllChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <ProfilePictureViewer src={chat.profilePic} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {chat.fullName}
            </h4>
            {chat.unreadCount > 0 && (
              <span className="ml-auto shrink-0 rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default ChatsList;
