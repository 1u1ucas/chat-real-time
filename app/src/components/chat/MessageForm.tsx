import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  messageService,
  CreateMessageDto,
} from "../../services/messageService";
import { SendHorizontal } from "lucide-react";
import { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

const MessageForm: React.FC<{ socket: Socket | null }> = ({ socket }) => {
  const { register, handleSubmit, reset, watch } = useForm<CreateMessageDto>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const messageText = watch("text", "");

  const allowToSend = messageText.trim() !== "";

  const mutation = useMutation({
    mutationFn: (data: CreateMessageDto) => messageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      reset();
    },
  });

  const onSubmit = async (data: CreateMessageDto) => {
    try {
      console.log("Envoi du message:", data);
      await mutation.mutateAsync(data);
      if (socket) {
        console.log("Socket disponible, émission de l'événement newMessage");
        const messageData = {
          text: data.text,
          userId: user?.id,
          userEmail: user?.email,
          timestamp: new Date().toISOString()
        };
        try {
          socket.emit("newMessage", messageData);
          console.log("Message envoyé au serveur");
        } catch (error) {
          console.error("Erreur lors de l'envoi du message:", error);
        }
      } else {
        console.log("Socket non disponible pour l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative">
      <div className="flex gap-2">
        <input
          {...register("text", { required: true })}
          type="text"
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={mutation.isPending || !allowToSend}
          className={`absolute right-0 top-0 bottom-0 rounded-r-lg bg-indigo-500 px-4 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer ${
            allowToSend ? "opacity-100" : "opacity-0"
          }`}
        >
          {mutation.isPending ? "Sending..." : <SendHorizontal />}
        </button>
      </div>
      {mutation.isError && (
        <p className="mt-2 text-sm text-red-600">
          Error sending message. Please try again.
        </p>
      )}
    </form>
  );
};

export default MessageForm;
