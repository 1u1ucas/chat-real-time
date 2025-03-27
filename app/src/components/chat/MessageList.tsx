import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    <div className="space-y-4">
      {messages?.map((message) => (
        <div key={message.id} className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-gray-800">{message.text}</p>
          <div className="flex justify-between items-center text-sm text-gray-500/60 mt-4">
            <p>{message?.user?.email}</p>
            <p className="">{new Date(message.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
