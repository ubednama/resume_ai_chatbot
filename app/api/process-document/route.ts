import { NextRequest, NextResponse } from 'next/server'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const pdfText = await extractTextFromPDF(file)

    const originalFileName = file.name.replace(/\.pdf$/i, '')
    const txtFileName = `${originalFileName}.txt`

    const blob = new Blob([pdfText], { type: 'text/plain' })
    
    // const vectorStore = await createVectorStore(pdfText)

    // Store the vectorStore in a global variable or database for later use
    // For simplicity, we'll use a global variable here
    // global.vectorStore = vectorStore

    // return NextResponse.json({ message: 'Document processed successfully. You can now ask questions about it.' })
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=${txtFileName}`,
      },
    })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json({ error: 'Error processing document' }, { status: 500 })
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const loader = new PDFLoader(new Blob([arrayBuffer]))
  const docs = await loader.load()
  return docs.map(doc => doc.pageContent).join('\n')
}

async function createVectorStore(text: string): Promise<MemoryVectorStore> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const docs = await splitter.createDocuments([text])
  
  return await MemoryVectorStore.fromDocuments(
    docs,
    new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    })
  )
}