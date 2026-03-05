'use client'

import Image from 'next/image'
import { useConversation } from '@elevenlabs/react'
import { useCallback, useState } from 'react'

interface ElevenLabsAgentCardProps {
  userEmail: string
}

export default function ElevenLabsAgentCard({ userEmail }: ElevenLabsAgentCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conversation = useConversation({
    onError: (err) => {
      setError(typeof err === 'string' ? err : 'Connection error')
      setIsLoading(false)
    },
    onDisconnect: () => {
      setIsLoading(false)
      setError(null)
    },
  })

  const isConnected = conversation.status === 'connected'
  const isConnecting = conversation.status === 'connecting' || isLoading

  const startConversation = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const res = await fetch('/api/elevenlabs-token')
      if (!res.ok) throw new Error('Failed to get session token')
      const { signedUrl } = await res.json()
      await conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
        dynamicVariables: { hubspot_email: userEmail },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
    } finally {
      setIsLoading(false)
    }
  }, [conversation])

  const stopConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  const hubUrl = `https://echo-hub.echobarrier.com?email=${encodeURIComponent(userEmail)}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=10&data=${encodeURIComponent(hubUrl)}`

  const statusText = isConnecting
    ? 'Connecting...'
    : isConnected
    ? conversation.isSpeaking
      ? 'Agent is speaking...'
      : 'Listening...'
    : 'Tap to start conversation'

  const statusColor = isConnected ? '#FF7026' : '#888'

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      }}
    >
      {/* QR Code Section */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <Image
          src={qrUrl}
          alt="Scan to Chat"
          width={160}
          height={160}
          style={{
            display: 'block',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
          unoptimized
        />
        <p
          style={{
            marginTop: '12px',
            marginBottom: 0,
            color: '#888',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Scan to chat on mobile
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '15px 0',
        }}
      >
        <div style={{ flex: 1, borderTop: '1px solid #eee' }} />
        <span
          style={{
            padding: '0 10px',
            color: '#ccc',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: 'Roboto, sans-serif',
            background: '#fff',
          }}
        >
          OR
        </span>
        <div style={{ flex: 1, borderTop: '1px solid #eee' }} />
      </div>

      {/* Agent Section */}
      <div style={{ textAlign: 'center' }}>
        <h3
          style={{
            margin: '0 0 6px 0',
            color: '#000',
            fontSize: '20px',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Talk with our AI Sales Training Agent
        </h3>
        <p
          style={{
            marginBottom: '20px',
            color: '#666',
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Feel free to ask any Echo Barrier related questions about sales,
          product specifications, local noise ordinance laws, and sales
          techniques.
        </p>

        {/* Mic Button */}
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={isConnecting}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isConnected ? '#FF7026' : isConnecting ? '#ccc' : '#FF7026',
            color: '#fff',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: isConnected
              ? '0 0 0 8px rgba(255,112,38,0.15), 0 4px 15px rgba(255,112,38,0.4)'
              : '0 4px 15px rgba(255,112,38,0.3)',
            transition: 'all 0.2s ease',
          }}
          aria-label={isConnected ? 'End conversation' : 'Start conversation'}
        >
          {isConnected ? (
            /* Stop icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : isConnecting ? (
            /* Spinner */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </path>
            </svg>
          ) : (
            /* Mic icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
              <path d="M19 10a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V21H9v2h6v-2h-2v-2.06A9 9 0 0 0 21 10h-2z" />
            </svg>
          )}
        </button>

        {/* Status */}
        <p
          style={{
            margin: '0 0 8px',
            color: statusColor,
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          {statusText}
        </p>

        {/* Error */}
        {error && (
          <p
            style={{
              margin: '0',
              color: '#e53e3e',
              fontSize: '12px',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
