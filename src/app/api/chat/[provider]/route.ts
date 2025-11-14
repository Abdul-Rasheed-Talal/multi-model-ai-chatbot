import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Type definitions
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  model?: string;
  apiKey?: string;
}

// API configurations
const PROVIDERS = {
  gemini: {
    defaultModel: "gemini-1.5-flash",
    envKey: "GEMINI_API_KEY",
    baseURL: undefined as undefined,
  },
  deepseek: {
    defaultModel: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    baseURL: "https://api.deepseek.com",
  },
  groq: {
    defaultModel: "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
    baseURL: "https://api.groq.com/openai/v1",
  },
} as const;

async function streamGemini(
  messages: Message[],
  model: string,
  apiKey: string
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  // Convert messages to Gemini format
  const chatHistory = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;

  const chat = geminiModel.startChat({
    history: chatHistory,
  });

  const result = await chat.sendMessageStream(lastMessage);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function streamOpenAICompatible(
  messages: Message[],
  model: string,
  apiKey: string,
  baseURL: string
) {
  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  const completion = await openai.chat.completions.create({
    model,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const body: ChatRequest = await request.json();
    const { messages, model, apiKey: userApiKey } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "Messages are required" }, { status: 400 });
    }

    const providerConfig = PROVIDERS[provider as keyof typeof PROVIDERS];
    if (!providerConfig) {
      return Response.json({ error: "Invalid provider" }, { status: 400 });
    }

    // Get API key from user input or environment variable
    const apiKey = userApiKey || process.env[providerConfig.envKey];
    if (!apiKey) {
      return Response.json(
        {
          error: `API key not configured for ${provider}`,
          needsKey: true,
        },
        { status: 401 }
      );
    }

    const selectedModel = model || providerConfig.defaultModel;

    // Route to appropriate streaming function
    if (provider === "gemini") {
      return await streamGemini(messages, selectedModel, apiKey);
    } else if (provider === "deepseek" || provider === "groq") {
      const baseURL = providerConfig.baseURL;
      if (!baseURL) {
        return Response.json(
          { error: "Base URL not configured" },
          { status: 500 }
        );
      }
      return await streamOpenAICompatible(
        messages,
        selectedModel,
        apiKey,
        baseURL
      );
    }

    return Response.json(
      { error: "Provider not implemented" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json(
      {
        error: error.message || "Internal server error",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
