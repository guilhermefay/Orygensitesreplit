
import React, { useState, useEffect, FormEvent } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { sendMessageToDify } from "@/lib/dify-api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

const DifyChat: React.FC = () => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      content: language === 'en' 
        ? "Hello! How can I help you today?" 
        : "Olá! Como posso ajudar você hoje?",
      sender: "ai",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  // Update initial message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "initial",
        content: language === 'en' 
          ? "Hello! How can I help you today?" 
          : "Olá! Como posso ajudar você hoje?",
        sender: "ai",
      }
    ]);
  }, [language]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        content: input,
        sender: "user",
      },
    ]);
    
    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      // Send message to Dify API
      const response = await sendMessageToDify(userMessage, conversationId);
      
      // Save conversation ID for future messages
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: response.message_id || Date.now().toString(),
          content: response.answer,
          sender: "ai",
        },
      ]);
    } catch (error) {
      console.error("Failed to get response:", error);
      // Show error message in the appropriate language
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: language === 'en'
            ? "Sorry, I had a problem processing your message. Please try again."
            : "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={message.sender === "ai" ? "/lovable-uploads/94d9a50f-ba0a-43da-b292-77572a0af92a.png" : undefined}
                fallback={message.sender === "user" ? "VC" : "LZ"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src="/lovable-uploads/94d9a50f-ba0a-43da-b292-77572a0af92a.png"
                fallback="LZ"
              />
              <ChatBubbleMessage isTyping typingText={language === 'en' ? "Lizia is typing..." : "Lizia está digitando..."} />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="border-t p-4 mt-auto">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-end"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'en' ? "Type your message..." : "Digite sua mensagem..."}
            className="flex-1 min-h-12 resize-none rounded-lg bg-background border p-3 shadow-none focus-visible:ring-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="h-12 w-12 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DifyChat;
