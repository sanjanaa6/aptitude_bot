import React, { useState, useEffect, useRef } from 'react'

// Voice utility component for speech-to-text and text-to-speech
export const VoiceUtils = {
  // Speech-to-text functionality
  useSpeechToText: () => {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState('')
    const recognitionRef = useRef(null)

    useEffect(() => {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Speech recognition is not supported in this browser')
        return
      }

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)
      }

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }
    }, [])

    const startListening = () => {
      if (recognitionRef.current) {
        setTranscript('')
        recognitionRef.current.start()
      }
    }

    const stopListening = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }

    const resetTranscript = () => {
      setTranscript('')
    }

    return {
      isListening,
      transcript,
      error,
      startListening,
      stopListening,
      resetTranscript
    }
  },

  // Text-to-speech functionality
  useTextToSpeech: () => {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [error, setError] = useState('')
    const utteranceRef = useRef(null)

    // Load saved voice settings
    const getSavedSettings = () => {
      try {
        const saved = localStorage.getItem('voiceSettings')
        return saved ? JSON.parse(saved) : null
      } catch (e) {
        return null
      }
    }

    useEffect(() => {
      // Check if browser supports speech synthesis
      if (!('speechSynthesis' in window)) {
        setError('Speech synthesis is not supported in this browser')
        return
      }

      return () => {
        if (utteranceRef.current) {
          window.speechSynthesis.cancel()
        }
      }
    }, [])

    const speak = (text, options = {}) => {
      if (!('speechSynthesis' in window)) {
        setError('Speech synthesis is not supported in this browser')
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Load saved settings and merge with provided options
      const savedSettings = getSavedSettings()
      const mergedOptions = { ...savedSettings, ...options }

      // Set options
      utterance.rate = mergedOptions.rate || 1.0
      utterance.pitch = mergedOptions.pitch || 1.0
      utterance.volume = mergedOptions.volume || 1.0
      utterance.lang = mergedOptions.lang || 'en-US'

      // Get available voices and set voice
      const voices = window.speechSynthesis.getVoices()
      let selectedVoice = null
      
      if (mergedOptions.voice) {
        selectedVoice = voices.find(voice => voice.name === mergedOptions.voice)
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.includes('en')) || voices[0]
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setError('')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        utteranceRef.current = null
      }

      utterance.onerror = (event) => {
        setError(`Speech synthesis error: ${event.error}`)
        setIsSpeaking(false)
        utteranceRef.current = null
      }

      window.speechSynthesis.speak(utterance)
    }

    const stop = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        utteranceRef.current = null
      }
    }

    const pause = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause()
      }
    }

    const resume = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume()
      }
    }

    return {
      isSpeaking,
      error,
      speak,
      stop,
      pause,
      resume
    }
  }
}

// Voice button component
export const VoiceButton = ({ 
  onTranscript, 
  onSpeak, 
  text = '', 
  type = 'input', // 'input' for speech-to-text, 'output' for text-to-speech
  disabled = false,
  style = {}
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const utteranceRef = useRef(null)

  // Load saved voice settings
  const getSavedSettings = () => {
    try {
      const saved = localStorage.getItem('voiceSettings')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  }

  // Initialize speech recognition for input type
  useEffect(() => {
    if (type === 'input') {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Speech recognition is not supported in this browser')
        return
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      const recognition = recognitionRef.current
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError('')
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Store the transcript for later use
        recognitionRef.current.transcript = finalTranscript + interimTranscript
      }

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }
    }
  }, [type])

  // Initialize speech synthesis for output type
  useEffect(() => {
    if (type === 'output') {
      if (!('speechSynthesis' in window)) {
        setError('Speech synthesis is not supported in this browser')
        return
      }

      return () => {
        if (utteranceRef.current) {
          window.speechSynthesis.cancel()
        }
      }
    }
  }, [type])

  const handleVoiceClick = () => {
    if (type === 'input') {
      if (isListening) {
        // Stop listening and send transcript
        if (recognitionRef.current) {
          recognitionRef.current.stop()
          const transcript = recognitionRef.current.transcript || ''
          if (transcript.trim() && onTranscript) {
            onTranscript(transcript.trim())
          }
        }
      } else {
        // Start listening
        if (recognitionRef.current) {
          recognitionRef.current.transcript = ''
          recognitionRef.current.start()
        }
      }
    } else if (type === 'output' && text) {
      if (isSpeaking) {
        // Stop speaking
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
          setIsSpeaking(false)
          utteranceRef.current = null
        }
      } else {
        // Start speaking
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()

          const utterance = new SpeechSynthesisUtterance(text)
          utteranceRef.current = utterance

          // Load saved settings and merge with provided options
          const savedSettings = getSavedSettings()
          const mergedOptions = { ...savedSettings, rate: 0.9, pitch: 1.0 }

          // Set options
          utterance.rate = mergedOptions.rate || 1.0
          utterance.pitch = mergedOptions.pitch || 1.0
          utterance.volume = mergedOptions.volume || 1.0
          utterance.lang = mergedOptions.lang || 'en-US'

          // Get available voices and set voice
          const voices = window.speechSynthesis.getVoices()
          let selectedVoice = null
          
          if (mergedOptions.voice) {
            selectedVoice = voices.find(voice => voice.name === mergedOptions.voice)
          }
          
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.lang.includes('en') && voice.name.includes('Google')
            ) || voices.find(voice => voice.lang.includes('en')) || voices[0]
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }

          utterance.onstart = () => {
            setIsSpeaking(true)
            setError('')
          }

          utterance.onend = () => {
            setIsSpeaking(false)
            utteranceRef.current = null
          }

          utterance.onerror = (event) => {
            setError(`Speech synthesis error: ${event.error}`)
            setIsSpeaking(false)
            utteranceRef.current = null
          }

          window.speechSynthesis.speak(utterance)
        }
      }
    }
  }

  const getButtonIcon = () => {
    if (type === 'input') {
      return isListening ? '🔴' : '🎤'
    } else {
      return isSpeaking ? '⏸️' : '🔊'
    }
  }

  const getButtonTitle = () => {
    if (type === 'input') {
      return isListening ? 'Stop listening' : 'Start voice input'
    } else {
      return isSpeaking ? 'Stop speaking' : 'Listen to text'
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleVoiceClick}
        disabled={disabled}
        title={getButtonTitle()}
        style={{
          background: isListening || isSpeaking ? '#ef4444' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          ...style
        }}
      >
        {getButtonIcon()}
      </button>
      
      {/* Listening indicator */}
      {isListening && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#ef4444',
          animation: 'pulse 1.5s infinite'
        }} />
      )}

      {/* Error display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          background: '#fef2f2',
          color: '#991b1b',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          marginTop: '4px',
          zIndex: 1000,
          whiteSpace: 'nowrap'
        }}>
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default VoiceUtils
