"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { UploadIcon, SendIcon, HomeIcon } from "lucide-react";
import FileUploadModal from "./FileUploadModal";

export default function ResumeChatApp() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const scrollAreaRef = useRef(null);

  const BASE_URL = "https://ai-chatbot-tiyp.onrender.com";

//   const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    const response = await axios.post(
    `${BASE_URL}/upload`, formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("File uploaded successfully:", response.data);
    setAnalysisResult(response.data.analysis_result);

    setMessages([
      {
        text: `Resume "${uploadedFile.name}" uploaded successfully. How can I help you with your resume?`,
        sender: "ai",
      },
    ]);
    setIsModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      try {
        const response = await axios.post(`${BASE_URL}/analyze`, {
          text: input,
          analysis_result: analysisResult,
        });

        setMessages((prev) => [
          ...prev,
          {
            text: response.data.message,
            sender: "ai",
          },
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, there was an error processing your request. Please try again.",
            sender: "ai",
          },
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-col h-full max-w-3xl w-full mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Resume Chat Assistant
            </h2>
            {file && (
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <HomeIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
          <div className="flex-grow flex flex-col p-4 h-full overflow-hidden">
            {!file ? (
              <div className="flex-grow flex items-center justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
                >
                  <UploadIcon className="mr-2 h-5 w-5" />
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div
                  ref={scrollAreaRef}
                  className="flex-grow overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-100 ml-auto"
                          : "bg-gray-100"
                      } max-w-[80%] w-fit ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 bg-gray-100 p-2 rounded-md">
                  <input
                    className="flex-grow bg-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                    type="text"
                    placeholder="Ask about your resume..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <SendIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
}
