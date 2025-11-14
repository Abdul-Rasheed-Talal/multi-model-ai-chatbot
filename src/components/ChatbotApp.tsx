"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import ChatInterface from "./ChatInterface";
import ChatSidebar from "./ChatSidebar";
import SettingsDialog from "./SettingsDialog";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-1.5-flash",
  deepseek: "deepseek-chat",
  groq: "llama-3.3-70b-versatile",
};

export default function ChatbotApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState(DEFAULT_MODELS.gemini);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load chats from localStorage
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      const parsed = JSON.parse(storedChats);
      setChats(parsed);
      if (parsed.length > 0) {
        setCurrentChatId(parsed[0].id);
        setProvider(parsed[0].provider);
        setModel(parsed[0].model);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }

    // Load API keys
    const storedKeys = localStorage.getItem("apiKeys");
    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys));
    }
  }, []);

  useEffect(() => {
    if (mounted && chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats, mounted]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "",
      messages: [],
      provider,
      model,
      createdAt: Date.now(),
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
  }, [provider, model]);

  const handleChatSelect = useCallback(
    (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        startTransition(() => {
          setCurrentChatId(chatId);
          setProvider(chat.provider);
          setModel(chat.model);
        });
      }
    },
    [chats]
  );

  const handleDeleteChat = useCallback((chatId: string) => {
    // Show confirmation dialog instead of immediate delete
    setDeleteConfirmId(chatId);
  }, []);

  const confirmDeleteChat = useCallback(
    (chatId: string) => {
      setChats((prevChats) => {
        const newChats = prevChats.filter((c) => c.id !== chatId);
        if (currentChatId === chatId && newChats.length > 0) {
          setCurrentChatId(newChats[0].id);
        } else if (newChats.length === 0) {
          // Will create new chat
          const newChat: Chat = {
            id: Date.now().toString(),
            title: "",
            messages: [],
            provider,
            model,
            createdAt: Date.now(),
          };
          setCurrentChatId(newChat.id);
          return [newChat];
        }
        return newChats;
      });
      setDeleteConfirmId(null);
    },
    [currentChatId, provider, model]
  );

  const handleExportChat = useCallback(
    (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;

      const exportData = {
        title: chat.title || "Chat Export",
        provider: chat.provider,
        model: chat.model,
        messages: chat.messages,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${chatId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [chats]
  );

  const handleMessagesChange = useCallback(
    (messages: Message[]) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages,
                title:
                  messages.length > 0 && !chat.title
                    ? messages[0].content.slice(0, 30)
                    : chat.title,
              }
            : chat
        )
      );
    },
    [currentChatId]
  );

  const handleProviderChange = useCallback(
    (newProvider: string) => {
      const newModel = DEFAULT_MODELS[newProvider];
      // Use startTransition to batch all state updates atomically
      startTransition(() => {
        setProvider(newProvider);
        setModel(newModel);
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, provider: newProvider, model: newModel }
              : chat
          )
        );
      });
    },
    [currentChatId]
  );

  const handleModelChange = useCallback(
    (newModel: string) => {
      setModel(newModel);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, model: newModel } : chat
        )
      );
    },
    [currentChatId]
  );

  const currentChat = chats.find((c) => c.id === currentChatId);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatSidebar
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={createNewChat}
          onProviderChange={handleProviderChange}
          onModelChange={handleModelChange}
          currentProvider={provider}
          currentModel={model}
          chats={chats}
          onDeleteChat={handleDeleteChat}
          onExportChat={handleExportChat}
          onShowSettings={() => setSettingsOpen(true)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Modern Header */}
          <div className="sticky top-0 z-40 border-b border-border glass-effect">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary text-white flex items-center justify-center font-bold text-sm">
                  AI
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  ChatHub
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  className="transition-smooth"
                  title="Settings"
                >
                  ⚙️
                </Button>
                <ThemeToggle />
              </div>
            </div>

            {/* Provider & Model Info */}
            <div className="px-6 pb-4 flex items-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-medium truncate">
                {model.split("-").slice(0, 2).join(" ")}
              </span>
            </div>
          </div>

          {currentChat && (
            <ChatInterface
              provider={provider}
              model={model}
              apiKey={apiKeys[provider]}
              chatId={currentChatId}
              onMessagesChange={handleMessagesChange}
              initialMessages={currentChat.messages}
            />
          )}
        </div>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmId && confirmDeleteChat(deleteConfirmId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
