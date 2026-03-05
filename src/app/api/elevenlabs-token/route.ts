import { NextResponse } from 'next/server'

const AGENT_ID = 'agent_8701k99rkkzefxav7qggmc2zfqpn'

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
    { headers: { 'xi-api-key': apiKey } }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('ElevenLabs API error:', response.status, errorBody)
    return NextResponse.json({ error: 'Failed to get signed URL', detail: errorBody, status: response.status }, { status: 502 })
  }

  const body = await response.json()
  console.log('ElevenLabs response body keys:', Object.keys(body))
  return NextResponse.json({ signedUrl: body.signed_url })
}
