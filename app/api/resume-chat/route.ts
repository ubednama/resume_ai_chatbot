import { NextRequest, NextResponse } from 'next/server'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { RetrievalQAChain } from "langchain/chains"

const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

  if (!global.resumeVectorStore) {
    return NextResponse.json({ error: 'No resume has been processed yet' }, { status: 400 })
  }

  try {
    const chain = RetrievalQAChain.fromLLM(model, global.resumeVectorStore.asRetriever())

    const response = await chain.call({
      query: message,
    })

    return NextResponse.json({ message: response.text })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json({ error: 'Error processing chat' }, { status: 500 })
  }
}

