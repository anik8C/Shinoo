import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    chats: [],
    allContacts: [],
    messages: [],
    deletedMessageIds: new Set(),
    selectedUser: null,
    activeTab: "chats",
    isUsersLoading: false,
    isMessagesLoading: false,
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
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true, messages: [] });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            const { deletedMessageIds } = get();
            set({
                messages: res.data.filter((message) => !deletedMessageIds.has(message._id))
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isMessagesLoading: false });
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
        // Immediately update the UI with the new message
        set((state) => ({ messages: [...state.messages, optimisticMessage] }));

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


            const isMessageForMe = message.receiverId === authUser._id;
            if (isMessageForMe && isSoundEnabled) {

                const notificationSound = new Audio("/sounds/notification.mp3");
                notificationSound.currentTime = 0;
                notificationSound.play().catch((e) => console.log("Error playing sound:", e));
            }

            if (!selectedUser) return;

            if ((message.senderId === selectedUser._id && message.receiverId === authUser._id) || (message.senderId === authUser._id && message.receiverId === selectedUser._id)) {
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
        const handleMessagesRead = ({ readerId, messageIds, readAt }) => {
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