import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    chats: [],
    allContacts: [],
    messages: [],
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
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isMessagesLoading: false });
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
            const res = await axiosInstance.post(`/messages/send123/${selectedUser._id}`, messageData);
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
    }

}))