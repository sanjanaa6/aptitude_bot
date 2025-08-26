# Voice Features Documentation

## Overview
The Quantitative Chatbot now includes comprehensive voice functionality for both speech-to-text and text-to-speech capabilities, making the learning experience more accessible and interactive.

## Features Implemented

### 1. Speech-to-Text (Voice Input)
- **Chat Component**: Users can speak their questions instead of typing
- **Voice Button**: Microphone button next to the chat input field
- **Real-time Transcription**: Shows what you're saying as you speak
- **Automatic Sending**: Transcribed text is automatically sent when you stop speaking

### 2. Text-to-Speech (Voice Output)
- **Chat Responses**: Listen to AI assistant responses
- **Quiz Questions**: Hear quiz questions read aloud
- **Quiz Options**: Listen to each answer option
- **Explanations**: Audio playback of learning content
- **Quiz Results**: Voice feedback on quiz completion and scores

### 3. Voice Settings
- **Accessible via**: Voice button in the header
- **Customizable Options**:
  - Voice selection (available system voices)
  - Speech rate (0.5x to 2.0x)
  - Speech pitch (0.5 to 2.0)
  - Volume control (0% to 100%)
- **Test Feature**: Try your settings with custom text
- **Persistent Settings**: Saved to localStorage

## How to Use

### Voice Input (Speech-to-Text)
1. Click the microphone button (🎤) next to the chat input
2. Speak your question clearly
3. Click the button again to stop recording
4. Your transcribed text will be sent automatically

### Voice Output (Text-to-Speech)
1. Look for speaker buttons (🔊) next to text content
2. Click to hear the content read aloud
3. Click again to stop playback

### Voice Settings
1. Click the "Voice" button in the header
2. Adjust your preferred settings
3. Test with the test feature
4. Save your settings

## Browser Compatibility

### Supported Browsers
- Chrome (recommended)
- Edge
- Safari
- Firefox

### Requirements
- HTTPS connection (required for microphone access)
- Microphone permissions granted
- Modern browser with Web Speech API support

## Technical Implementation

### Components
- `VoiceUtils.jsx`: Core voice functionality utilities
- `VoiceButton.jsx`: Reusable voice button component
- `VoiceSettings.jsx`: Settings configuration panel

### APIs Used
- **Web Speech API**: Native browser speech recognition and synthesis
- **SpeechRecognition**: For speech-to-text
- **SpeechSynthesis**: For text-to-speech

### Features
- **Error Handling**: Graceful fallbacks for unsupported browsers
- **Voice Persistence**: Settings saved in localStorage
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Screen reader friendly

## Accessibility Benefits

1. **Visual Impairments**: Audio content for all text
2. **Motor Disabilities**: Voice input as alternative to typing
3. **Learning Disabilities**: Multi-modal learning (text + audio)
4. **Language Learning**: Pronunciation assistance
5. **Mobile Users**: Hands-free interaction

## Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions
2. **No voice output**: Ensure system volume is on
3. **Poor recognition**: Speak clearly in a quiet environment
4. **Settings not saving**: Check browser localStorage support

### Browser Permissions
- Allow microphone access when prompted
- Ensure the site is accessed via HTTPS
- Check browser settings for speech recognition

## Future Enhancements

Potential improvements for future versions:
- Voice commands for navigation
- Multiple language support
- Custom voice training
- Voice activity detection
- Offline voice processing
- Integration with external TTS services

## Support

For issues with voice features:
1. Check browser compatibility
2. Verify microphone permissions
3. Test with different browsers
4. Ensure HTTPS connection
5. Check system audio settings

