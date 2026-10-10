import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    chats: [],
    allContacts: [],
    messages: [],
    deletedMessageIds: new Set(),
    receivedMessageIds: new Set(),
    selectedUser: null,
    activeTab: "chats",
    isUsersLoading: false,
    isMessagesLoading: false,
    messageRequestId: 0,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

    toggleSound: () => {
        set({ isSoundEnabled: !get().isSoundEnabled });
        localStorage.setItem("isSoundEnabled", get().isSoundEnabled);
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    getAllContacts: async () => {
        set({ isUsersLoading: true });

        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getAllChatPartners: async () => {
        set({ isUsersLoading: true });

        try {
            const res = await axiosInstance.get("/messages/chats");
            set((state) => {
                const currentById = new Map(state.chats.map((chat) => [chat._id, chat]));
                const chats = res.data.map((chat) => {
                    const current = currentById.get(chat._id);
                    if (!current || new Date(chat.latestMessageAt) >= new Date(current.latestMessageAt)) {
                        return chat;
                    }
                    return { ...chat, ...current };
                });
                return {
                    chats: chats.sort(
                        (a, b) => new Date(b.latestMessageAt) - new Date(a.latestMessageAt)
                    )
                };
            });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        if (!userId) return;
        const requestId = get().messageRequestId + 1;
        set({ isMessagesLoading: true, messages: [], messageRequestId: requestId });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            if (get().messageRequestId !== requestId || get().selectedUser?._id !== userId) return;
            const { deletedMessageIds } = get();
            const messagesById = new Map(
                get().messages
                    .filter((message) => !deletedMessageIds.has(message._id))
                    .map((message) => [message._id, message])
            );
            res.data.forEach((message) => messagesById.set(message._id, message));
            set({
                messages: [...messagesById.values()]
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
                chats: get().chats.map((chat) =>
                    chat._id === userId ? { ...chat, unreadCount: 0 } : chat
                )
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            if (get().messageRequestId === requestId) set({ isMessagesLoading: false });
        }
    },

    removeMessage: (messageId) => {
        set((state) => {
            const deletedMessageIds = new Set(state.deletedMessageIds);
            deletedMessageIds.add(messageId);
            return {
                deletedMessageIds,
                messages: state.messages.filter((message) => message._id !== messageId)
            };
        });
    },

    markMessagesRead: async (userId) => {
        if (!userId) return;
        set((state) => ({
            chats: state.chats.map((chat) =>
                chat._id === userId ? { ...chat, unreadCount: 0 } : chat
            )
        }));
        try {
            const res = await axiosInstance.patch(`/messages/${userId}/read`);
            if (!res.data.messageIds?.length) return;
            const readIds = new Set(res.data.messageIds);
            set((state) => ({
                messages: state.messages.map((message) =>
                    readIds.has(message._id)
                        ? { ...message, readAt: res.data.readAt }
                        : message
                )
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update read status");
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        const { authUser } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true, // Flag to identify optimistic messages(optional)
        };
        const moveChatToTop = (message) => set((state) => {
            const existing = state.chats.find((chat) => chat._id === selectedUser._id);
            if (!existing) return state;
            const updated = {
                ...existing,
                latestMessageAt: message.createdAt,
                unreadCount: 0
            };
            return {
                chats: [updated, ...state.chats.filter((chat) => chat._id !== selectedUser._id)]
            };
        });
        // Immediately update the UI with the new message
        set((state) => ({ messages: [...state.messages, optimisticMessage] }));
        moveChatToTop(optimisticMessage);

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set((state) => {
                const idx = state.messages.findIndex(msg => msg._id === tempId);
                if (idx === -1) {
                    return { messages: [...state.messages, res.data] };
                }

                const nxt = [...state.messages];
                nxt[idx] = res.data;
                return { messages: nxt };
            });
            moveChatToTop(res.data);
        } catch (error) {
            // console.log(error);
            set((state) => ({ messages: state.messages.filter(msg => msg._id !== tempId) })); // Remove the optimistic message on error
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    subscribeToNewMessages: () => {
        // const { selectedUser, isSoundEnabled } = get();
        // if (!selectedUser) return;

        // const socket = useAuthStore.getState().socket;
        // const authUser = useAuthStore.getState().authUser;

        // socket.on('newMessage', (message) => {
        //     const notificationSound = new Audio("/sounds/notification.mp3");

        //     if ((message.senderId === selectedUser._id && message.receiverId === authUser._id) || (message.senderId === authUser._id && message.receiverId === selectedUser._id)) {
        //         set((state) => ({ messages: [...state.messages, message] }));
        //         if (isSoundEnabled) {
        //             notificationSound.currentTime = 0;
        //             notificationSound.play().catch((e) => console.log("Error playing sound:", e));
        //         }
        //     }
        // })

        const socket = useAuthStore.getState().socket;

        const handleNewMessage = (message) => {

            const { selectedUser, isSoundEnabled } = get();
            const authUser = useAuthStore.getState().authUser;
            if (!authUser) return;
            let isDuplicate = false;
            set((state) => {
                if (state.receivedMessageIds.has(message._id)) {
                    isDuplicate = true;
                    return state;
                }
                const receivedMessageIds = new Set(state.receivedMessageIds);
                receivedMessageIds.add(message._id);
                return { receivedMessageIds };
            });
            if (isDuplicate) return;

            const isMessageForMe = message.receiverId === authUser._id;
            if (isMessageForMe && isSoundEnabled) {

                const notificationSound = new Audio("/sounds/notification.mp3");
                notificationSound.currentTime = 0;
                notificationSound.play().catch((e) => console.log("Error playing sound:", e));
            }

            const isConversationMessage =
                message.senderId === authUser._id || message.receiverId === authUser._id;
            if (!isConversationMessage) return;

            const partnerId = message.senderId === authUser._id
                ? message.receiverId
                : message.senderId;
            const isActiveConversation = selectedUser?._id === partnerId;
            set((state) => {
                const existing = state.chats.find((chat) => chat._id === partnerId);
                if (!existing) return state;
                const updated = {
                    ...existing,
                    latestMessageAt: message.createdAt,
                    unreadCount: message.receiverId === authUser._id && !isActiveConversation
                        ? (existing.unreadCount || 0) + 1
                        : existing.unreadCount || 0
                };
                return {
                    chats: [updated, ...state.chats.filter((chat) => chat._id !== partnerId)]
                };
            });

            if (!isActiveConversation) {
                if (!get().chats.some((chat) => chat._id === partnerId)) get().getAllChatPartners();
                return;
            }

            if (selectedUser && ((message.senderId === selectedUser._id && message.receiverId === authUser._id) || (message.senderId === authUser._id && message.receiverId === selectedUser._id))) {
                set((state) => {
                    const exists = state.messages.some(msg => msg._id === message._id);
                    if (exists) return state; // Prevent duplicate messages in case of race condition while lodaing initial chat history initially and receiving a new message at the same time.

                    return { messages: [...state.messages, message] }
                }
                );
                if (message.senderId === selectedUser._id && message.receiverId === authUser._id) {
                    get().markMessagesRead(selectedUser._id);
                }
            }
        }

        socket.on("newMessage", handleNewMessage);
        const handleMessagesRead = ({ readerId, senderId, conversationId, messageIds, readAt }) => {
            const authUser = useAuthStore.getState().authUser;
            if (readerId === authUser?._id) {
                const partnerId = conversationId || senderId;
                set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat._id === partnerId ? { ...chat, unreadCount: 0 } : chat
                    )
                }));
            }
            const { selectedUser } = get();
            if (!selectedUser || selectedUser._id !== readerId) return;
            const readIds = new Set(messageIds);
            set((state) => ({
                messages: state.messages.map((message) =>
                    readIds.has(message._id)
                        ? { ...message, readAt }
                        : message
                )
            }));
        };
        const handleMessageDeleted = ({ messageId, senderId, receiverId }) => {
            const authUser = useAuthStore.getState().authUser;
            const { selectedUser } = get();
            if (!authUser || !selectedUser) return;
            const isParticipant =
                (senderId === authUser._id && receiverId === selectedUser._id) ||
                (receiverId === authUser._id && senderId === selectedUser._id);
            if (isParticipant) get().removeMessage(messageId);
        };
        socket.on("messagesRead", handleMessagesRead);
        socket.on("messageDeleted", handleMessageDeleted);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesRead", handleMessagesRead);
            socket.off("messageDeleted", handleMessageDeleted);
        }
    },

    // unsubscribeFromNewMessages: () => {
    //     const socket = useAuthStore.getState().socket;
    //     socket.off('newMessage');
    // },

}))