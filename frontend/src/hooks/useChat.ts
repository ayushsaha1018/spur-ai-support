import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { api } from '../services/api';

export type Message = {
  id?: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
};

function getInitialSessionId(): string | null {
  try {
    return localStorage.getItem('chat_session_id');
  } catch {
    return null;
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(getInitialSessionId);

  useEffect(() => {
    const id = getInitialSessionId();
    if (id) {
      api.get(`/chat/history`, { params: { sessionId: id } })
        .then((res) => setMessages(res.data.messages || []))
        .catch((err) => {
          if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) {
            localStorage.removeItem('chat_session_id');
            setSessionId(null);
          }
          console.error("Failed to fetch history:", err);
        });
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: Message = { sender: 'user', content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const payload: { message: string; sessionId?: string } = { message: text };
        if (sessionId) {
          payload.sessionId = sessionId;
        }

        const res = await api.post('/chat/message', payload);
        const aiMessage: Message = { sender: 'ai', content: res.data.reply };
        setMessages((prev) => [...prev, aiMessage]);

        if (res.data.sessionId) {
          setSessionId(res.data.sessionId);
          localStorage.setItem('chat_session_id', res.data.sessionId);
        }
      } catch (err) {
        console.error(err);
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Network error: Unable to reach the server.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const resetChat = useCallback(() => {
    localStorage.removeItem('chat_session_id');
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, setError, resetChat };
}
