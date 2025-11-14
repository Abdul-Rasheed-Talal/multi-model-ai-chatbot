"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, User, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  provider: string;
  model: string;
  apiKey?: string;
  chatId: string;
  onMessagesChange: (messages: Message[]) => void;
  initialMessages?: Message[];
}

export default function ChatInterface({
  provider,
  model,
  apiKey,
  chatId,
  onMessagesChange,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only reset messages when switching chats (chatId changes).
    // Avoid syncing on `initialMessages` reference changes to prevent
    // feedback loops where parent updates messages -> passes new
    // `initialMessages` -> we reset local state -> parent updates again.
    setMessages(initialMessages);
  }, [chatId]);

  useEffect(() => {
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Note: API keys should be kept server-side. Do not send apiKey from the client.

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/${provider}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          model,
          // Note: server should use stored API keys or a secure secrets store to call providers.
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                assistantMessage += parsed.content;
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === "assistant") {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: assistantMessage,
                      },
                    ];
                  }
                  return [
                    ...prev,
                    {
                      role: "assistant",
                      content: assistantMessage,
                      timestamp: Date.now(),
                    },
                  ];
                });
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Chat error:", err);
      // Remove the incomplete message on error
      setMessages(newMessages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary text-white text-3xl">
                ✨
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  Start Chatting
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Ask anything! Powered by{" "}
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 animate-in ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                🤖
              </div>
            )}

            <div
              className={`max-w-[65%] ${
                message.role === "user"
                  ? "message-bubble-user"
                  : "message-bubble-assistant"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-bold">
                👤
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
              🤖
            </div>
            <div className="message-bubble-assistant">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3 animate-in items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              ⚠️
            </div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 max-w-[65%]">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container glass-effect">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Shift+Enter for new line)"
            className="chat-input min-h-[48px] resize-none"
            disabled={isLoading}
          />

          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="h-[48px] w-[48px] flex-shrink-0 rounded-lg btn-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
