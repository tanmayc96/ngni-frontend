
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot } from 'lucide-react';
import { chatWithReport } from '@/ai/flows/chat-with-report-flow';
import type { ROIRegion } from '@/types/roi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface ChatbotProps {
  regionData: ROIRegion;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot({ regionData }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I can answer questions about the report for ${regionData?.name || 'this region'}.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  // Update initial message when region changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I can answer questions about the report for ${regionData?.name || 'this region'}.`,
      }
    ]);
  }, [regionData?.name]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!regionData) {
      toast({
        variant: "destructive",
        title: "No Region Selected",
        description: "Please select a region on the map before asking questions.",
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithReport({ question: input, report: regionData });
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
       toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: "Could not get a response from the AI assistant.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[300px] bg-muted/50 rounded-lg border">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3 text-sm prose dark:prose-invert prose-p:my-0',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
               <div className="bg-muted p-3 rounded-lg flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
               </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-2 border-t bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this region..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
