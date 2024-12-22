"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { SparklesIcon } from "lucide-react";
import React from "react";

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="w-full h-full pb-20">
      <div className="flex flex-col w-full max-w-2xl py-8 mx-auto stretch">
        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div
                key={m.id}
                className={cn(
                  "whitespace-pre-wrap p-4 mb-4 ml-auto bg-gray-200/80 rounded-xl shadow-md"
                )}
              >
                {m.content}
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={cn("whitespace-pre-wrap inline-flex gap-4 p-4 mb-4")}
            >
              <SparklesIcon className="w-6 h-6 flex-shrink-0 text-yellow-500" />
              {m.content}
            </div>
          );
        })}

        <form onSubmit={handleSubmit}>
          <Input
            autoComplete="off"
            className="fixed resize-none h-16 bottom-0 w-full max-w-2xl p-4 mb-8 border border-gray-300 rounded-xl shadow-xl"
            value={input}
            placeholder="A pdf template for an invoice..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}
