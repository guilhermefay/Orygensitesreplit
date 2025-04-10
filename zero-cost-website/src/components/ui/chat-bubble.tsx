import React from "react";
import { cn } from "@/lib/utils";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
}

export function ChatBubble({
  children,
  className,
  variant = "received",
  ...props
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-end",
        variant === "sent" ? "ml-auto justify-end" : "",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-2 flex max-w-md flex-col space-y-2 rounded-lg px-4 py-2",
          variant === "sent"
            ? "items-end rounded-bl-none bg-muted text-muted-foreground"
            : "order-2 items-start rounded-br-none bg-primary text-primary-foreground"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

export function ChatBubbleAvatar({
  src,
  fallback,
  className,
  ...props
}: ChatBubbleAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={fallback}
          className="rounded-full object-cover h-full w-full"
        />
      ) : (
        <span className="text-xs font-medium">{fallback}</span>
      )}
    </div>
  );
}

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  isTyping?: boolean;
  typingText?: string;
}

export function ChatBubbleMessage({
  children,
  className,
  variant,
  isTyping = false,
  typingText = "Typing...",
  ...props
}: ChatBubbleMessageProps) {
  return (
    <div className={cn("text-sm", className)} {...props}>
      {isTyping ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{typingText}</span>
          <span className="flex space-x-1">
            <span className="animate-bounce h-1.5 w-1.5 rounded-full bg-current opacity-60" style={{ animationDelay: "0ms" }}></span>
            <span className="animate-bounce h-1.5 w-1.5 rounded-full bg-current opacity-60" style={{ animationDelay: "150ms" }}></span>
            <span className="animate-bounce h-1.5 w-1.5 rounded-full bg-current opacity-60" style={{ animationDelay: "300ms" }}></span>
          </span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function ChatBubbleContainer() {
  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex flex-col space-y-4 overflow-y-auto">
        <div className="flex items-end">
          <div className="order-2 mx-2 flex max-w-md flex-col items-start space-y-2 rounded-lg rounded-br-none bg-primary px-4 py-2 text-primary-foreground">
            <ChatBubbleMessage>
              Hi, I&apos;m a message from the user
            </ChatBubbleMessage>
          </div>
        </div>
        <div className="ml-auto flex items-end justify-end">
          <div className="mx-2 flex max-w-md flex-col items-end space-y-2 rounded-lg rounded-bl-none bg-muted px-4 py-2 text-muted-foreground">
            <ChatBubbleMessage>
              I&apos;m a reply from the bot
            </ChatBubbleMessage>
          </div>
        </div>
      </div>
      <style>
        {`
          .chat-container {
            display: flex;
            flex-direction: column;
            min-height: 100%;
            padding: 1rem;
          }
          
          .chat-messages {
            flex-grow: 1;
            overflow-y: auto;
          }
        `}
      </style>
    </div>
  );
}
