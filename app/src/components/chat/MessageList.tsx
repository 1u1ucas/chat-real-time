import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { getTimeElapsed } from "../../utils/timeUtils";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Socket } from "socket.io-client";

interface MessageListProps {
  socket: Socket | null;
}

const MessageList: React.FC<MessageListProps> = ({ socket }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [timeElapsed, setTimeElapsed] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

  const likeMutation = useMutation({
    mutationFn: (messageId: string) => messageService.toggleLike(messageId),
    onSuccess: (updatedMessage) => {
      // Émettre l'événement de like via Socket.IO
      if (socket && user) {
        socket.emit("messageLiked", {
          messageId: updatedMessage.id,
          userId: user.id,
          likes: updatedMessage.likes,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleLike = (messageId: string) => {
    if (user) {
      likeMutation.mutate(messageId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mise à jour du temps écoulé toutes les minutes
  useEffect(() => {
    if (!messages) return;

    const updateTimeElapsed = () => {
      const newTimeElapsed: { [key: string]: string } = {};
      messages.forEach((message) => {
        newTimeElapsed[message.id] = getTimeElapsed(message.createdAt, true);
      });
      setTimeElapsed(newTimeElapsed);
    };

    updateTimeElapsed();
    const interval = setInterval(updateTimeElapsed, 60000);

    return () => clearInterval(interval);
  }, [messages]);

  // Écouter les likes en temps réel
  useEffect(() => {
    if (!socket) return;

    socket.on("messageLiked", (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    });

    return () => {
      socket.off("messageLiked");
    };
  }, [socket, queryClient]);

  if (isLoading) {
    return <div className="text-center">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading messages. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages?.map((message) => (
        <div key={message.id} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-gray-800">{message.text}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500/60 mt-2">
                <p className="font-medium">{message?.user?.email}</p>
                <span>•</span>
                <p>{timeElapsed[message.id]}</p>
              </div>
            </div>
            <button
              onClick={() => handleLike(message.id)}
              className={`ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors ${
                message.likes?.some((like) => like.userId === user?.id)
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              <Heart 
                className={`w-5 h-5 ${
                  message.likes?.some((like) => like.userId === user?.id)
                    ? "fill-current stroke-current"
                    : ""
                }`}
              />
            </button>
          </div>
          {message.likes && message.likes.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {message.likes.length} {message.likes.length === 1 ? "like" : "likes"}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
