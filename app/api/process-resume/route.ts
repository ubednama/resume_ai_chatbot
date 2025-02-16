import { NextRequest, NextResponse } from 'next/server'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

const RESUME_KEYWORDS = [
  "resume", "cv", "curriculum vitae", "experience", "education", "skills", "summary", "objective",
  "work history", "professional experience", "qualifications", "certifications", "contact information"
];

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const resumeText = await extractTextFromPDF(file)

    if (!isResume(resumeText)) {
      return NextResponse.json({ error: 'Please upload a valid resume' }, { status: 400 })
    }

    const vectorStore = await createVectorStore(resumeText)
    // Store the vectorStore in a global variable or database for later use
    // For simplicity, we'll use a global variable here
    global.vectorStore = vectorStore

    return NextResponse.json({ message: 'Resume processed successfully. You can now ask questions about it.' })
  } catch (error) {
    console.error('Error processing resume:', error)
    return NextResponse.json({ error: 'Error processing resume' }, { status: 500 })
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

function isResume(text: string): boolean {
  const lowerText = text.toLowerCase()
  const keywordCount = RESUME_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length
  const threshold = 3 // Adjust this threshold based on your requirements
  return keywordCount >= threshold
}
