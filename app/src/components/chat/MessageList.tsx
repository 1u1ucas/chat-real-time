import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { getTimeElapsed } from "../../utils/timeUtils";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [timeElapsed, setTimeElapsed] = useState<{ [key: string]: string }>({});
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

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
        console.log('Message:', message.text);
        console.log('Date du message:', message.createdAt);
        console.log('Type de la date:', typeof message.createdAt);
        const date = new Date(message.createdAt);
        console.log('Date convertie:', date);
        console.log('Timestamp:', date.getTime());
        console.log('Maintenant:', new Date().getTime());
        console.log('Différence en secondes:', (new Date().getTime() - date.getTime()) / 1000);
        
        newTimeElapsed[message.id] = getTimeElapsed(message.createdAt);
      });
      setTimeElapsed(newTimeElapsed);
    };

    updateTimeElapsed();
    const interval = setInterval(updateTimeElapsed, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, [messages]);

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
            <div>
              <p className="text-gray-800">{message.text}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500/60 mt-2">
                <p className="font-medium">{message?.user?.email}</p>
                <span>•</span>
                <p>{timeElapsed[message.id] || getTimeElapsed(message.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
