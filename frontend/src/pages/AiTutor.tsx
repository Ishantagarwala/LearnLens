import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Trash2, MessageSquare, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatItem {
  id: string;
  title: string;
  createdAt: string;
}

export default function AiTutor() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/chats').then((r) => setChats(r.data.chats)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async (id: string) => {
    try {
      const res = await api.get(`/chats/${id}/messages`);
      setActiveChatId(id);
      setMessages(res.data.chat.messages.map((m: any) => ({ role: m.role, content: m.content })));
      setSidebarOpen(false);
    } catch {
      toast.error('Failed to load chat');
    }
  };

  const newChat = async () => {
    try {
      const res = await api.post('/chats', { title: 'New Chat' });
      setChats((p) => [res.data.chat, ...p]);
      setActiveChatId(res.data.chat.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch {
      toast.error('Failed to create chat');
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await api.delete(`/chats/${id}`);
      setChats((p) => p.filter((c) => c.id !== id));
      if (activeChatId === id) { setActiveChatId(null); setMessages([]); }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const send = async () => {
    if (!input.trim() || streaming) return;

    let chatId = activeChatId;
    if (!chatId) {
      try {
        const res = await api.post('/chats', { title: 'New Chat' });
        chatId = res.data.chat.id;
        setChats((p) => [res.data.chat, ...p]);
        setActiveChatId(chatId);
      } catch {
        toast.error('Failed to create chat');
        return;
      }
    }

    const userMsg: ChatMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    await api.post(`/chats/${chatId}/messages`, { role: 'user', content: userMsg.content }).catch(() => {});

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userMsg.content,
          chatHistory: messages.slice(-10),
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  aiContent += parsed.content;
                  setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = { role: 'assistant', content: aiContent };
                    return copy;
                  });
                }
              } catch { /* skip malformed chunks */ }
            }
          }
        }
      }

      if (aiContent) {
        await api.post(`/chats/${chatId}/messages`, { role: 'assistant', content: aiContent }).catch(() => {});
      }
    } catch {
      toast.error('Failed to get response');
      setMessages((prev) => prev.filter((m) => m.content !== ''));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <PageWrapper className="px-0 sm:px-4">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-6rem)]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-20 inset-y-0 left-0 w-72 lg:w-64 bg-brand-dark/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-r border-white/5 lg:border-0 pt-20 lg:pt-0 transition-transform`}>
          <div className="p-4 space-y-3 h-full flex flex-col">
            <button onClick={newChat} className="w-full btn-primary !py-2.5 text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> New Chat
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
              {chats.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition ${
                    activeChatId === c.id ? 'bg-brand-purple/10 text-white' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span onClick={() => loadChat(c.id)} className="flex-1 truncate text-sm">{c.title}</span>
                  <button onClick={() => deleteChat(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sidebarOpen && <div className="lg:hidden fixed inset-0 z-10 bg-black/50" onClick={() => setSidebarOpen(false)} />}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden px-4 py-2">
            <button onClick={() => setSidebarOpen(true)} className="text-sm text-gray-400 flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> Chats
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">AI Tutor</h2>
                <p className="text-gray-500 text-sm max-w-md">
                  Ask me anything about careers, study tips, coding concepts, interview prep, or learning strategies.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-purple/20 text-white'
                    : 'glass-card text-gray-300'
                }`}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        code: ({ children, className }) => {
                          const isBlock = className?.includes('language-');
                          return isBlock ? (
                            <pre className="bg-black/30 rounded-xl p-3 overflow-x-auto my-2"><code className="text-xs">{children}</code></pre>
                          ) : (
                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-brand-violet text-xs">{children}</code>
                          );
                        },
                      }}
                    >
                      {m.content || '...'}
                    </ReactMarkdown>
                  ) : m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition"
                disabled={streaming}
              />
              <button onClick={send} disabled={streaming || !input.trim()} className="btn-primary !px-4 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
