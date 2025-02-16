'use client'

import { useState, useRef, useEffect } from 'react'
import { UploadIcon, SendIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Message {
  text: string
  sender: 'user' | 'ai'
}

interface ChatBoxProps {
  title: string
  uploadButtonText: string
  inputPlaceholder: string
  onFileUpload: (file: File) => Promise<{ type: string; message: string }>
  onSendMessage: (message: string) => Promise<string>
}

export default function ChatBox({
  title,
  uploadButtonText,
  inputPlaceholder,
  onFileUpload,
  onSendMessage,
}: ChatBoxProps) {
  const [file, setFile] = useState<File | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setIsProcessing(true)
      setIsUploadModalOpen(false)
      try {
        const initialResponse = await onFileUpload(uploadedFile)
        console.log(initialResponse)
        if(initialResponse?.type === 'error') {
          setMessages([{ text: initialResponse?.message, sender: 'ai' }])
          setFile(null)
        } else setMessages([{ text: initialResponse.message, sender: 'ai' }])
      } catch (error) {
        console.error('Error processing file:', error)
        setMessages([{ text: 'Error processing file. Please try again.', sender: 'ai' }])
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleSendMessage = async () => {
    if (input.trim() && !isProcessing) {
      const userMessage = { text: input, sender: 'user' as const };
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsProcessing(true)
      try {
        const aiResponse = await onSendMessage(input)
        setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }])
      } catch (error) {
        console.error('Error sending message:', error)
        setMessages(prev => [...prev, { text: 'Error getting response. Please try again.', sender: 'ai' }])
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col h-[calc(100%-8rem)] overflow-hidden">
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.sender === 'user' ? 'bg-primary/10 ml-auto' : 'bg-secondary'
                } max-w-[80%] w-fit ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                {message.text}
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Input
            className="flex-grow"
            type="text"
            placeholder={inputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isProcessing || !file}
          />
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UploadIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{uploadButtonText}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center p-6">
                <label className="cursor-pointer flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-md">
                  <UploadIcon className="mr-2 h-5 w-5" />
                  {uploadButtonText}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !file}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

