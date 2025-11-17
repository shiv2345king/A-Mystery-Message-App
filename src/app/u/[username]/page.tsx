'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar).filter(Boolean);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function Page() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [completion, setCompletion] = useState(initialMessageString);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(false);
  const [acceptanceLoading, setAcceptanceLoading] = useState(true);
  
  // Use ref to track if we've already fetched
  const hasFetched = useRef(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  // Check if user is accepting messages - only run once
  useEffect(() => {
    // Only fetch if we haven't already and have a username
    if (hasFetched.current || !username) {
      setAcceptanceLoading(false);
      return;
    }

    hasFetched.current = true;
    
    const checkAcceptance = async () => {
      try {
        console.log('Checking acceptance for:', username);
        const response = await axios.get('/api/send-message', {
          params: { username },
        });

        console.log('Full acceptance response:', response.data);
        console.log('isAcceptingMessages value:', response.data.isAcceptingMessages);
        console.log('Type of isAcceptingMessages:', typeof response.data.isAcceptingMessages);

        // Explicitly check for true
        if (response.data.success && response.data.isAcceptingMessages === true) {
          console.log('Setting isAcceptingMessages to TRUE');
          setIsAcceptingMessages(true);
        } else {
          console.log('Setting isAcceptingMessages to FALSE');
          setIsAcceptingMessages(false);
        }
      } catch (err) {
        console.error('Error checking acceptance:', err);
        setIsAcceptingMessages(false);
      } finally {
        setAcceptanceLoading(false);
      }
    };

    checkAcceptance();
  }, []); // Empty dependency array - run only once on mount

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast.success(response.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message ?? 'Failed to send message';
      console.error('Send message error:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setError(null);
    try {
      console.log('Fetching suggested messages...');

      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate engaging questions',
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to fetch suggestions');
      }

      const result = await response.text();
      console.log('Final raw result:', result);

      const cleanedResult = result.trim();
      const parsedMessages = parseStringMessages(cleanedResult);
      
      console.log('Parsed messages:', parsedMessages);

      if (parsedMessages.length === 0) {
        throw new Error('No messages were generated');
      }

      setCompletion(cleanedResult);
      toast.success('Suggestions generated!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching messages:', errorMessage);
      setError(errorMessage);
      toast.error(`Failed: ${errorMessage}`);
    } finally {
      setIsSuggestLoading(false);
    }
  };

  if (acceptanceLoading) {
    return (
      <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      {isAcceptingMessages ? (
        <>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-center text-green-800">
              <span className="font-semibold">@{username}</span> is currently accepting messages ✓
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your anonymous message here"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                {isLoading ? (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading || !messageContent}>
                    Send It
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="space-y-4 my-8">
            <div className="space-y-2">
              <Button
                type="button"
                onClick={fetchSuggestedMessages}
                className="my-4"
                disabled={isSuggestLoading}
              >
                {isSuggestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Suggest Messages'
                )}
              </Button>
              <p>Click on any message below to select it.</p>
            </div>
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Messages</h3>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  parseStringMessages(completion).map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="mb-2"
                      onClick={() => handleMessageClick(message)}
                    >
                      {message}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="my-8 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800 text-lg font-semibold mb-2">
            ✗ User is not accepting messages
          </p>
          <p className="text-red-600">
            @{username} has disabled anonymous messages at this time. Please try again later.
          </p>
        </div>
      )}

      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}