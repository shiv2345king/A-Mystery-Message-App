'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';

type UserMessage = {
  _id: string;
  content: string;
  createdAt: string | Date;
};

function UserDashboard() {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [acceptMessages, setAcceptMessages] = useState<boolean>(false);

  const { data: session } = useSession();

  // -------------------------------------------------
  // ✔ Fetch accept messages (correct backend key)
  // -------------------------------------------------
  const fetchAcceptMessages = useCallback(async () => {
    try {
      setIsSwitchLoading(true);

      const response = await axios.get<ApiResponse>('/api/accept-messages');

      // 🔥 CORRECT KEY — backend returns isAcceptingMessages
      setAcceptMessages(response.data.isAcceptingMessages === true);

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ??
        'Failed to fetch message settings'
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, []);

  // -------------------------------------------------
  // ✔ Fetch messages
  // -------------------------------------------------
  const fetchMessages = useCallback(async (refresh = false) => {
    try {
      setIsLoading(true);

      const response = await axios.get<ApiResponse>('/api/get-messages');

      const formatted = (response.data.messages || []).map((msg: any) => ({
        _id: String(msg._id),
        content: msg.content,
        createdAt: msg.createdAt,
      }));

      setMessages(formatted);

      if (refresh) toast.success('Showing latest messages');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? 'Failed to fetch messages'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -------------------------------------------------
  // ✔ Load everything when user logged-in
  // -------------------------------------------------
  useEffect(() => {
    if (!session?.user) return;

    fetchAcceptMessages();
    fetchMessages();
  }, [session?.user]);

  // -------------------------------------------------
  // ✔ Handle toggle
  // -------------------------------------------------
  const handleSwitchChange = async () => {
    const newValue = !acceptMessages;

    // optimistic UI
    setAcceptMessages(newValue);

    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: newValue,
      });

      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      // revert on failure
      setAcceptMessages(!newValue);

      toast.error(
        axiosError.response?.data.message ??
        'Failed to update message settings'
      );
    }
  };

  // -------------------------------------------------
  // ✔ Delete message instantly from UI
  // -------------------------------------------------
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  if (!session?.user) return <></>;

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied.');
  };

  // -------------------------------------------------
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Profile URL */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      {/* Accept Messages Toggle */}
      <div className="mb-4">
        <div className="flex items-center">
          <Switch
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Messages */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages from Others</h2>
          <Button
            variant="outline"
            onClick={() => fetchMessages(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            messages.map(msg => (
              <MessageCard
                key={msg._id}
                message={{
                  _id: msg._id,
                  content: msg.content,
                  createdAt: new Date(msg.createdAt),
                }}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No messages yet.</p>
              <p className="text-gray-400 text-sm mt-2">
                Share your link to get messages!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
