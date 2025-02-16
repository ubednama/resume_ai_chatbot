'use client'

import ChatBox from '@/components/ChatBox'

export default function ResumeChatPage() {
  const handleFileUpload = async (file: File): Promise<{ type: string; message: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/process-resume', {
      method: 'POST',
      body: formData,
    })

    if(response.status === 400) {
      const result = await response.json()
      return {type : "error", message: result.error}
    }

    if (!response.ok && response.status !== 400) {
      throw new Error('Failed to get response')
    }

    const result = await response.json()
    return { type: "success", message: result.message };
  }

  const handleSendMessage = async (message: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    console.log(response)

    
    if (!response.ok) {
      throw new Error('Failed to process resume')
    }

    const result = await response.json()
    return result.message
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      <div className="flex flex-col h-full max-w-3xl w-full mx-auto p-4">
        <ChatBox
          title="Document Chat Assistant"
          uploadButtonText="Upload Resume"
          inputPlaceholder="Ask about the resume..."
          onFileUpload={handleFileUpload}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}