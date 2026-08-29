import { useAuthStore } from "../store/useAuthStore";

function ChatPage() {
  const { logout } = useAuthStore();

  return (
    <div className="z-10">
      ChatPage
      <button className="ml-2" onClick={logout}>
        <strong>Logout</strong>
      </button>
    </div>
  );
}

export default ChatPage;
