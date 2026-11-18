"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  FaCommentDots,
  FaPaperPlane,
  FaRobot,
  FaSpinner,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { CurrentUser } from "@/app/types/current-user";
import { apiFetch } from "@/app/utils/api-client";
import { CurrentUserResponse } from "./Header";

// Represents a single message in the conversation history
type ChatMessage = {
  sender: "user" | "agent";
  text: string;
};

export default function ChatBox() {
  const pathname = usePathname();

  // Authentication state
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chat UI and session state
  const [isOpen, setIsOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Reference to the bottom of the message list for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check if the customer is signed in on route change or auth event
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await apiFetch<CurrentUserResponse>(
          "/api/users/currentuser",
          { credentials: "include" },
        );
        setCurrentUser(data.currentUser);

        // Reset chat state if the user is signed out
        if (!data.currentUser) {
          setIsOpen(false);
          setChatSessionId(null);
          setMessages([]);
        }
      } catch {
        setCurrentUser(null);
        setIsOpen(false);
        setChatSessionId(null);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    // Re-check auth state when the user signs out from the Header
    const handleAuthChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [pathname]);

  // Automatically scroll to the latest message when messages update or chat opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isSending]);

  // Only show the chatbox when the customer is authenticated
  if (isLoading || !currentUser) {
    return null;
  }

  // Handle sending a user message to the AI agent
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    // Optimistically append the user's message to the chat window
    const userMsg: ChatMessage = {
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserMessage("");
    setIsSending(true);

    try {
      let activeSessionId = chatSessionId;

      // Step 1 (first message only): Create a new chat session to get chatSessionId
      if (!activeSessionId) {
        const sessionData = await apiFetch<{ chatSessionId: string }>(
          "/api/agents",
          {
            method: "POST",
            credentials: "include",
          },
        );
        activeSessionId = sessionData.chatSessionId;
        setChatSessionId(activeSessionId);
      }

      // Step 2: Send the user's message and current IANA timezone to the active chat session
      const replyData = await apiFetch<{ response: string }>(
        `/api/agents/${activeSessionId}`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            userMessage: trimmedMessage,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        },
      );

      // Append the agent's response to the chat window
      const agentMsg: ChatMessage = {
        sender: "agent",
        text: replyData.response,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to get a response from the assistant",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[28rem] w-80 sm:w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
          {/* Header */}
          <div className="flex items-center justify-between bg-sky-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <FaRobot className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">
                  Flight Assistant
                </h3>
                <p className="text-[11px] text-sky-100">
                  Ask us anything about flights &amp; orders
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-sky-100 transition hover:bg-white/20 hover:text-white focus:outline-none"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 ? (
              /* Empty state before the first message is sent */
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 px-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <FaCommentDots className="text-xl" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  How can we help you today?
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Send a message to start chatting with our assistant.
                </p>
              </div>
            ) : (
              /* Conversation history */
              messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={index}
                    className={`flex items-end gap-2 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                        <FaRobot className="text-xs" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm break-words ${
                        isUser
                          ? "rounded-br-xs bg-sky-600 text-white"
                          : "rounded-bl-xs border border-slate-200 bg-white text-slate-800 shadow-2xs"
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`underline underline-offset-2 ${
                                isUser
                                  ? "text-sky-100 hover:text-white"
                                  : "text-sky-600 hover:text-sky-700"
                              }`}
                            >
                              {children}
                            </a>
                          ),
                          code: ({ className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code
                                className={`rounded px-1 py-0.5 font-mono text-xs ${
                                  isUser
                                    ? "bg-sky-700 text-sky-50"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <code
                                className="block overflow-x-auto rounded-lg bg-slate-900 p-2.5 font-mono text-xs text-slate-100"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="mb-2 last:mb-0">{children}</pre>
                          ),
                          h1: ({ children }) => (
                            <h1 className="mb-1.5 text-base font-bold">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-1.5 text-sm font-bold">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-1 text-sm font-semibold">
                              {children}
                            </h3>
                          ),
                          table: ({ children }) => (
                            <div className="mb-2 overflow-x-auto last:mb-0">
                              <table className="w-full border-collapse text-xs">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th
                              className={`border px-2 py-1 text-left font-semibold ${
                                isUser
                                  ? "border-sky-500 bg-sky-700"
                                  : "border-slate-200 bg-slate-100"
                              }`}
                            >
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td
                              className={`border px-2 py-1 ${
                                isUser ? "border-sky-500" : "border-slate-200"
                              }`}
                            >
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                    {isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <FaUser className="text-xs" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Loading indicator while waiting for the agent's response */}
            {isSending && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <FaRobot className="text-xs" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-500 shadow-2xs">
                  <FaSpinner className="animate-spin text-sky-600" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {/* Anchor element used to scroll to the bottom of the chat */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!userMessage.trim() || isSending}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:bg-sky-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaCommentDots className="text-2xl" />
        )}
      </button>
    </div>
  );
}
