'use client'

import ChatBox from '@/components/ChatBox'

export default function DocumentChatPage() {
  const handleFileUpload = async (file: File): Promise<{ type: string; message: string }> => {
    const formData = new FormData()
    formData.append('file', file)
  
    const response = await fetch('/api/process-document', {
      method: 'POST',
      body: formData,
    })
  
    if (response.status === 400) {
      const result = await response.json()
      return { type: "error", message: result.error }
    }
  
    if (!response.ok) {
      throw new Error('Failed to process document')
    }
  
    // Check if the response is a blob (text file)
    const contentType = response.headers.get('Content-Type')
    if (contentType === 'text/plain') {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
  
      // Get the filename from the Content-Disposition header
      const disposition = response.headers.get('Content-Disposition')
      const fileNameMatch = disposition?.match(/filename="(.+)"/)
      const fileName = fileNameMatch ? fileNameMatch[1] : 'extracted_text.txt'
  
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      return { type: "success", message: 'File downloaded successfully' }
    }
  
    const result = await response.json()
    return { type: "success", message: result.message }
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
      throw new Error('Failed to get response')
    }

    const result = await response.json()
    return result.message
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      <div className="flex flex-col h-full max-w-3xl w-full mx-auto p-4">
        <ChatBox
          title="Document Chat Assistant"
          uploadButtonText="Upload Document"
          inputPlaceholder="Ask about the document..."
          onFileUpload={handleFileUpload}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}

