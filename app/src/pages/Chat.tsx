import { useAuth } from "@/contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import UserInfo from "../components/chat/UserInfo";
import LogoutButton from "../components/LogoutButton";
import { Socket } from "socket.io-client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const Chat = ({ socket }: { socket: Socket | null }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      console.log("Socket non disponible");
      return;
    }

    console.log("Chat component mounted, setting up socket listeners");

    // Écouter tous les événements pour le débogage
    socket.onAny((event, ...args) => {
      console.log("Événement Socket.IO reçu:", event, args);
    });

    socket.on("connect", () => {
      console.log("Socket connecté dans le composant Chat");
    });

    socket.on("receivedMessage", (data) => {
      console.log("Nouveau message reçu dans Chat:", data);
      // Invalider le cache des messages pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    });

    return () => {
      console.log("Chat component unmounting, cleaning up socket listeners");
      socket.off("receivedMessage");
      socket.off("connect");
      socket.offAny();
    };
  }, [socket, queryClient]);

  return (
    <div className="container mx-auto w-full w-full h-screen">
      <div className="rounded-lg w-full h-full">
        <div className="h-5/6 relative">
          <div className="backdrop-blur-sm bg-white/50 h-1/6 absolute top-0 right-3 w-full"></div>
          <div className="overflow-y-scroll h-full">
            <MessageList />
          </div>
        </div>
        <div className="h-1/6 flex justify-center items-center">
          <div className="w-full gap-4 flex flex-col gap-4">
            {user && (
              <div className="">
                <MessageForm socket={socket} />
              </div>
            )}
            <div className=" flex justify-between">
              <UserInfo />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
