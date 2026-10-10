import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  // const { logout } = useAuthStore();
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full max-w-6xl h-full md:h-[min(800px,calc(100dvh-2rem))]">
      <BorderAnimatedContainer>
        {/*LEFT SIDE*/}
        <div
          className={`${
            selectedUser ? "hidden md:flex" : "flex"
          } w-full md:w-80 md:flex-none flex-1 bg-slate-800/50 backdrop-blur-sm flex-col min-h-0 h-full`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/*RIGHT SIDE*/}
        <div
          className={`${
            selectedUser ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-slate-900/50 backdrop-blur-sm min-w-0 min-h-0 h-full`}
        >
          {selectedUser ? <ChatContainer key={selectedUser._id} /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;
