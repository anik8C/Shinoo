import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import SelectionToolbar from "./SelectionToolbar";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    removeMessage,
    messages,
    isMessagesLoading,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const longPressRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const pointerStartRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState(() => new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedMessages = messages.filter((message) => selectedMessageIds.has(message._id));
  const latestReadOutgoingId = [...messages]
    .reverse()
    .find((message) => message.senderId === authUser._id && message.readAt)?._id;

  const clearSelection = () => setSelectedMessageIds(new Set());
  const toggleSelection = (messageId) => {
    setSelectedMessageIds((current) => {
      const liveMessageIds = new Set(messages.map((message) => message._id));
      const next = new Set([...current].filter((id) => liveMessageIds.has(id)));
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const selectMessage = (messageId) => {
    setSelectedMessageIds(new Set([messageId]));
    setOpenMenuId(null);
  };

  const deleteSelectedMessages = async () => {
    if (!selectedMessages.length || isDeleting) return;
    if (!window.confirm(`Delete ${selectedMessages.length} message${selectedMessages.length === 1 ? "" : "s"}?`)) return;

    try {
      setIsDeleting(true);
      await Promise.all(
        selectedMessages.map((message) =>
          axiosInstance.delete(`/messages/delete/${message._id}`)
        )
      );
      selectedMessages.forEach((message) => removeMessage(message._id));
      clearSelection();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest("[data-message-menu]")) setOpenMenuId(null);
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (openMenuId) setOpenMenuId(null);
      else if (selectedMessageIds.size) clearSelection();
    };
    document.addEventListener("click", closeMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(longPressRef.current);
    };
  }, [openMenuId, selectedMessageIds]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    // subscribeToNewMessages();

    // return () => {
    //   unsubscribeFromNewMessages();
    // };
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {selectedMessages.length ? (
        <SelectionToolbar
          count={selectedMessages.length}
          canDelete={selectedMessages.every((message) => message.senderId === authUser._id)}
          isDeleting={isDeleting}
          onDelete={deleteSelectedMessages}
          onCancel={clearSelection}
        />
      ) : (
        <ChatHeader />
      )}
      <div className="flex-1 px-3 sm:px-6 overflow-y-auto py-4 sm:py-8 min-h-0">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              // console.log("sender:", msg.senderId, typeof msg.senderId);
              // console.log("auth:", authUser._id, typeof authUser._id);
              return (
                <div
                  key={msg._id}
                  onClick={() => {
                    if (longPressTriggeredRef.current) {
                      longPressTriggeredRef.current = false;
                      return;
                    }
                    if (selectedMessages.length) toggleSelection(msg._id);
                  }}
                  onPointerDown={(event) => {
                    if (event.pointerType !== "touch" || event.target.closest("button, a, img")) return;
                    pointerStartRef.current = { x: event.clientX, y: event.clientY };
                    longPressTriggeredRef.current = false;
                    longPressRef.current = window.setTimeout(() => {
                      longPressTriggeredRef.current = true;
                      selectMessage(msg._id);
                    }, 500);
                  }}
                  onPointerMove={(event) => {
                    const start = pointerStartRef.current;
                    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) {
                      clearTimeout(longPressRef.current);
                    }
                  }}
                  onPointerUp={() => clearTimeout(longPressRef.current)}
                  onPointerCancel={() => clearTimeout(longPressRef.current)}
                  className={`chat min-w-0 ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble relative max-w-[85%] break-words cursor-pointer pr-10 ${selectedMessageIds.has(msg._id) ? "ring-2 ring-cyan-300" : ""} ${msg.senderId === authUser._id ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}
                  >
                    <div data-message-menu className="absolute right-1 top-1 z-10">
                      <button
                        type="button"
                        aria-label="Message options"
                        className="rounded p-1 opacity-70 hover:bg-black/20 hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((current) => current === msg._id ? null : msg._id);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === msg._id && (
                        <div className="absolute right-0 top-8 w-28 rounded-md bg-slate-700 p-1 shadow-lg">
                          <button
                            type="button"
                            className="w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              selectMessage(msg._id);
                            }}
                          >
                            Select
                          </button>
                        </div>
                      )}
                    </div>
                    {msg.image && (
                      <a
                        href={msg.image}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg max-h-48 w-full max-w-full object-cover cursor-pointer"
                        />
                      </a>
                    )}
                    {msg.text && <p className="mt-2">{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {msg._id === latestReadOutgoingId && (
                    <span className="mt-1 text-[10px] text-slate-400">Seen</span>
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />
    </>
  );
}

export default ChatContainer;
