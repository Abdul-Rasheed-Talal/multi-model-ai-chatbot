"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, AlertCircle } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApiKeys {
  gemini: string;
  deepseek: string;
  groq: string;
}

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    gemini: "",
    deepseek: "",
    groq: "",
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Load API keys from localStorage only when dialog opens
    if (open && isMounted) {
      const stored = localStorage.getItem("apiKeys");
      if (stored) {
        try {
          setApiKeys(JSON.parse(stored));
        } catch {
          // If parsing fails, keep default empty state
        }
      }
    }
  }, [open, isMounted]);

  const handleSave = () => {
    localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys Configuration
          </DialogTitle>
          <DialogDescription>
            Enter your API keys for each provider. Keys are stored locally in
            your browser.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Get your free API keys:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Gemini
                </a>{" "}
                - Free tier available
              </li>
              <li>
                <a
                  href="https://platform.deepseek.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  DeepSeek
                </a>{" "}
                - Free tier with credits
              </li>
              <li>
                <a
                  href="https://console.groq.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Groq
                </a>{" "}
                - Free tier with high speed
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="gemini">Google Gemini API Key</Label>
            <Input
              id="gemini"
              type="password"
              placeholder="AIza..."
              value={apiKeys.gemini}
              onChange={(e) =>
                setApiKeys({ ...apiKeys, gemini: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deepseek">DeepSeek API Key</Label>
            <Input
              id="deepseek"
              type="password"
              placeholder="sk-..."
              value={apiKeys.deepseek}
              onChange={(e) =>
                setApiKeys({ ...apiKeys, deepseek: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groq">Groq API Key</Label>
            <Input
              id="groq"
              type="password"
              placeholder="gsk_..."
              value={apiKeys.groq}
              onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Keys</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
