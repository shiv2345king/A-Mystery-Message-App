'use client'

import React from 'react'
import axios, { AxiosError } from 'axios'
import { X } from 'lucide-react'
import dayjs from 'dayjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'

// ---------------------------------------------
// 🔥 Frontend-only message type (NEVER use your backend schema here)
// ---------------------------------------------
type MessageCardMessage = {
  _id: string
  content: string
  createdAt: string | Date
}

type MessageCardProps = {
  message: MessageCardMessage
  onMessageDelete: (messageId: string) => void
}

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      )

      toast.success(response.data.message)

      // 🔥 Instantly update UI
      onMessageDelete(message._id)

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(
        axiosError.response?.data.message ||
          'An error occurred while deleting the message.'
      )
    }
  }

  return (
    <Card className="card-bordered">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-sm text-gray-500">
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
      </CardHeader>

      <CardContent />
    </Card>
  )
}
