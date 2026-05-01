'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChatMessage } from '@/types';

interface ChatPanelProps {
  lessonId: string;
}

export default function ChatPanel({ lessonId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lessonId }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        citations: data.citations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <aside className="w-96 shrink-0 border-l border-[#1F2937] flex flex-col bg-[#091A2F]">
      {/* Header */}
      <div className="p-4 border-b border-[#1F2937]">
        <h2 className="font-semibold text-[#E5E7EB]">AI Course Tutor</h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Ask questions about this lesson</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-[#9CA3AF] text-center mt-10">
            Ask a question to get started.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#182432] text-[#E5E7EB]'
              }`}
            >
              <p>{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#1F2937] space-y-1">
                  {msg.citations.map((c, i) => (
                    <p key={i} className="text-xs opacity-60">
                      ↗ {c.startTime} — {c.text.slice(0, 50)}…
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#182432] rounded-xl px-3.5 py-2.5 text-sm text-[#9CA3AF]">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1F2937]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this lesson…"
            disabled={isLoading}
            className="flex-1 border border-[#1F2937] rounded-lg px-3 py-2 text-sm bg-[#182432] text-[#E5E7EB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
