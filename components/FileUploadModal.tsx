'use client'

import { useState } from 'react'
import { UploadIcon, XIcon } from 'lucide-react'
import { Button } from './ui/button'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUpload: (file: File) => void
}

export default function FileUploadModal({ isOpen, onClose, onFileUpload }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    const uploadedFile = event.dataTransfer.files[0]
    if (uploadedFile) {
      setFile(uploadedFile)
    }
  }

  const handleSubmit = () => {
    if (file) {
      onFileUpload(file)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload Resume</h2>
          <Button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="h-6 w-6" />
          </Button>
        </div>
        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">Drag and drop your resume here, or</p>
          <label className="cursor-pointer text-blue-500 hover:text-blue-600">
            <span>browse</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        {file && <p className="text-sm text-gray-600 mb-4">Selected file: {file.name}</p>}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={!file}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>
    </div>
  )
}

