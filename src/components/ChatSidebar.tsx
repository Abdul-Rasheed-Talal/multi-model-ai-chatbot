"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MessageSquare,
  Trash2,
  Download,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  provider: string;
  model: string;
  createdAt: number;
}

interface ChatSidebarProps {
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  currentProvider: string;
  currentModel: string;
  chats: Chat[];
  onDeleteChat: (chatId: string) => void;
  onExportChat: (chatId: string) => void;
  onShowSettings: () => void;
}

const PROVIDERS = [
  { value: "gemini", label: "Google Gemini", icon: "🧠" },
  { value: "deepseek", label: "DeepSeek", icon: "🔮" },
  { value: "groq", label: "Groq (LLaMA)", icon: "⚡" },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
  gemini: [
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
  deepseek: [{ value: "deepseek-chat", label: "DeepSeek Chat" }],
  groq: [
    { value: "llama-3.3-70b-versatile", label: "LLaMA 3.3 70B" },
    { value: "llama-3.1-70b-versatile", label: "LLaMA 3.1 70B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  ],
};

export default function ChatSidebar({
  currentChatId,
  onChatSelect,
  onNewChat,
  onProviderChange,
  onModelChange,
  currentProvider,
  currentModel,
  chats,
  onDeleteChat,
  onExportChat,
  onShowSettings,
}: ChatSidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getChatTitle = (chat: Chat) => {
    if (chat.title) return chat.title;
    const firstUserMessage = chat.messages.find((m) => m.role === "user");
    return firstUserMessage?.content.slice(0, 30) + "..." || "New Chat";
  };

  // Validate that currentModel exists in the current provider's models
  const availableModels = MODELS[currentProvider] || [];
  const isValidModel = availableModels.some((m) => m.value === currentModel);

  return (
    <div className="flex h-full w-80 flex-col overflow-hidden sidebar-container">
      {/* Modern Gradient Header */}
      <div className="sidebar-header space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary text-white flex items-center justify-center font-bold text-lg">
              💬
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">ChatHub</h2>
              <p className="text-xs text-white/70">AI Conversations</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShowSettings}
            className="text-white hover:bg-white/20 transition-smooth"
          >
            ⚙️
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full btn-primary text-sm gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Provider & Model Selection */}
      <div className="space-y-4 border-b border-border p-4 bg-gradient-to-b from-card to-transparent">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            🚀 Provider
          </label>
          <Select value={currentProvider} onValueChange={onProviderChange}>
            <SelectTrigger className="w-full chat-input text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  <span className="flex items-center gap-2">
                    <span>{provider.icon}</span>
                    {provider.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            🎯 Model
          </label>
          {isValidModel ? (
            <Select
              key={currentProvider}
              value={currentModel}
              onValueChange={onModelChange}
            >
              <SelectTrigger className="w-full chat-input text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-full h-10 flex items-center justify-center border rounded-lg chat-input bg-muted">
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            📜 Conversations
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3 pb-4">
            {chats.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                Start a new conversation to begin!
              </p>
            )}
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative rounded-lg p-3 transition-all duration-200 hover:shadow-elevation-2 cursor-pointer",
                  currentChatId === chat.id
                    ? "gradient-primary text-white shadow-elevation-2"
                    : "bg-card hover:bg-card/80 border border-transparent hover:border-border"
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-lg shrink-0 mt-0.5">💬</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {getChatTitle(chat)}
                    </p>
                    <p className="text-xs opacity-70 line-clamp-2">
                      {chat.messages.length} messages
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportChat(chat.id);
                    }}
                    title="Export chat"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-red-500/20 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
