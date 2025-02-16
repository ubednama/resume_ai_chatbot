'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileTextIcon, FileIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

const Navbar = () => {

  const pathname = usePathname()

  const [activeTab, setActiveTab] = useState(pathname)

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">AI Chat Assistant</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === '/'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('/')}
              >
                <FileTextIcon className="mr-2 h-5 w-5" />
                Resume Chat
              </Link> */}
              <Link
                href="/document-chat"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === '/document-chat'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('/document-chat')}
              >
                <FileIcon className="mr-2 h-5 w-5" />
                Document Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

