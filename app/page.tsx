"use client";

import {
  Bot,
  Copy,
  CornerDownLeft,
  Loader2,
  MessageSquareText,
  Plus,
  Sparkles,
  UserRound
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Draft a launch plan for a new SaaS feature.",
  "Explain retrieval augmented generation in simple terms.",
  "Create a customer support chatbot flow.",
  "Review this prompt and make it stronger."
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am your Gemini-powered assistant. Ask me to write, reason, plan, summarize, or build prompts with you."
  }
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const apiMessages = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .map(({ role, content }) => ({ role, content })),
    [messages]
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: trimmed }]
        })
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: data.message ?? "I could not generate a response."
        }
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The assistant could not respond. Please try again.";

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: message
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  async function copyMessage(message: Message) {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  function startNewChat() {
    setMessages(initialMessages);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Chat controls">
        <div className="brand">
          <span className="brandIcon">
            <Sparkles size={20} />
          </span>
          <div>
            <p>Gemini</p>
            <h1>Chat Studio</h1>
          </div>
        </div>

        <button className="newChatButton" type="button" onClick={startNewChat}>
          <Plus size={18} />
          New chat
        </button>

        <div className="promptList" aria-label="Starter prompts">
          <span className="sectionLabel">Try a prompt</span>
          {starterPrompts.map((prompt) => (
            <button
              className="promptButton"
              key={prompt}
              type="button"
              onClick={() => {
                setInput(prompt);
                inputRef.current?.focus();
              }}
            >
              <MessageSquareText size={16} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        <div className="modelPanel">
          <span className="sectionLabel">Model</span>
          <strong>Gemini 2.5 Flash</strong>
          <p>Fast, capable responses for production chat workflows.</p>
        </div>
      </aside>

      <section className="chatPanel" aria-label="AI chat">
        <header className="topbar">
          <div>
            <span className="statusDot" />
            <span>Online assistant</span>
          </div>
          <p>Private server-side API route</p>
        </header>

        <div className="messages">
          {messages.map((message) => (
            <article className={`messageRow ${message.role}`} key={message.id}>
              <div className="avatar" aria-hidden="true">
                {message.role === "assistant" ? (
                  <Bot size={18} />
                ) : (
                  <UserRound size={18} />
                )}
              </div>

              <div className="bubble">
                <div className="bubbleMeta">
                  <span>{message.role === "assistant" ? "Assistant" : "You"}</span>
                  <button
                    aria-label="Copy message"
                    className="iconButton"
                    type="button"
                    onClick={() => void copyMessage(message)}
                  >
                    <Copy size={15} />
                  </button>
                </div>
                <p>{message.content}</p>
                {copiedId === message.id ? (
                  <span className="copyToast">Copied</span>
                ) : null}
              </div>
            </article>
          ))}

          {isLoading ? (
            <article className="messageRow assistant">
              <div className="avatar" aria-hidden="true">
                <Bot size={18} />
              </div>
              <div className="bubble typing">
                <Loader2 size={18} />
                Thinking with Gemini
              </div>
            </article>
          ) : null}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            aria-label="Message"
            value={input}
            placeholder="Ask Gemini anything..."
            rows={1}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button disabled={isLoading || !input.trim()} type="submit">
            {isLoading ? (
              <Loader2 className="spinIcon" size={18} />
            ) : (
              <CornerDownLeft size={18} />
            )}
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
