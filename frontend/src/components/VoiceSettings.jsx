import React, { useState, useEffect } from 'react'
import { VoiceUtils } from './VoiceUtils.jsx'

const containerStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  maxWidth: '500px',
  margin: '0 auto'
}

const titleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1f2937',
  marginBottom: '24px',
  textAlign: 'center'
}

const sectionStyle = {
  marginBottom: '24px'
}

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '12px'
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#6b7280',
  marginBottom: '8px'
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s ease'
}

const rangeContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}

const rangeStyle = {
  flex: 1
}

const valueStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  minWidth: '40px',
  textAlign: 'center'
}

const buttonStyle = {
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%'
}

const testButtonStyle = {
  ...buttonStyle,
  background: '#10b981',
  marginTop: '12px'
}

const errorStyle = {
  background: '#fef2f2',
  color: '#991b1b',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px'
}

const successStyle = {
  background: '#f0fdf4',
  color: '#065f46',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px'
}

export default function VoiceSettings({ onClose }) {
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [speechRate, setSpeechRate] = useState(1.0)
  const [speechPitch, setSpeechPitch] = useState(1.0)
  const [speechVolume, setSpeechVolume] = useState(1.0)
  const [testText, setTestText] = useState('Hello! This is a test of the voice settings.')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { speak, stop, isSpeaking } = VoiceUtils.useTextToSpeech()

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // Set default voice (prefer English voices)
        const defaultVoice = availableVoices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Google')
        ) || availableVoices.find(voice => voice.lang.includes('en')) || availableVoices[0]
        
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name)
        }
      } else {
        setError('Speech synthesis is not supported in this browser')
      }
    }

    // Load voices immediately if available
    loadVoices()
    
    // Also listen for voices to be loaded
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const handleTestVoice = () => {
    if (!testText.trim()) {
      setError('Please enter some text to test')
      return
    }

    const selectedVoiceObj = voices.find(voice => voice.name === selectedVoice)
    
    speak(testText, {
      rate: speechRate,
      pitch: speechPitch,
      volume: speechVolume,
      voice: selectedVoiceObj
    })
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      voice: selectedVoice,
      rate: speechRate,
      pitch: speechPitch,
      volume: speechVolume
    }
    
    localStorage.setItem('voiceSettings', JSON.stringify(settings))
    setSuccess('Voice settings saved successfully!')
    
    setTimeout(() => {
      setSuccess('')
    }, 3000)
  }

  const handleResetSettings = () => {
    setSelectedVoice('')
    setSpeechRate(1.0)
    setSpeechPitch(1.0)
    setSpeechVolume(1.0)
    setTestText('Hello! This is a test of the voice settings.')
    
    // Reset localStorage
    localStorage.removeItem('voiceSettings')
    setSuccess('Voice settings reset to defaults!')
    
    setTimeout(() => {
      setSuccess('')
    }, 3000)
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🎤 Voice Settings</h2>
      
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      {/* Voice Selection */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Voice</h3>
        <label style={labelStyle}>Select Voice:</label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select a voice...</option>
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Speech Rate */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Speech Rate</h3>
        <label style={labelStyle}>Speed: {speechRate.toFixed(1)}x</label>
        <div style={rangeContainerStyle}>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            style={rangeStyle}
          />
          <span style={valueStyle}>{speechRate.toFixed(1)}x</span>
        </div>
      </div>

      {/* Speech Pitch */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Speech Pitch</h3>
        <label style={labelStyle}>Pitch: {speechPitch.toFixed(1)}</label>
        <div style={rangeContainerStyle}>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechPitch}
            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
            style={rangeStyle}
          />
          <span style={valueStyle}>{speechPitch.toFixed(1)}</span>
        </div>
      </div>

      {/* Speech Volume */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Volume</h3>
        <label style={labelStyle}>Volume: {Math.round(speechVolume * 100)}%</label>
        <div style={rangeContainerStyle}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={speechVolume}
            onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
            style={rangeStyle}
          />
          <span style={valueStyle}>{Math.round(speechVolume * 100)}%</span>
        </div>
      </div>

      {/* Test Voice */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Test Voice</h3>
        <label style={labelStyle}>Test Text:</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          placeholder="Enter text to test the voice settings..."
        />
        <button
          onClick={handleTestVoice}
          disabled={isSpeaking}
          style={testButtonStyle}
        >
          {isSpeaking ? '🔴 Stop' : '▶️ Test Voice'}
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button onClick={handleSaveSettings} style={buttonStyle}>
          💾 Save Settings
        </button>
        <button 
          onClick={handleResetSettings} 
          style={{ ...buttonStyle, background: '#6b7280' }}
        >
          🔄 Reset
        </button>
      </div>

      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            ...buttonStyle, 
            background: '#ef4444', 
            marginTop: '12px' 
          }}
        >
          ❌ Close
        </button>
      )}
    </div>
  )
}

