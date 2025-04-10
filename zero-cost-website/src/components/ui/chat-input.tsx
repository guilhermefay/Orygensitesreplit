
import * as React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => {
    const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
      
      if (props.onChange) {
        props.onChange(e)
      }
    }

    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none overflow-hidden text-sm outline-none placeholder:text-muted-foreground",
          className
        )}
        rows={1}
        onChange={adjustHeight}
        {...props}
      />
    )
  }
)

ChatInput.displayName = "ChatInput"
