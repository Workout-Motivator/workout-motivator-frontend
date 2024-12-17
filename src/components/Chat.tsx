import React, { useState, useRef, useCallback, useEffect, FormEvent } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { auth } from '../firebaseConfig';
import { ChatMessage } from '../types/chat';
import { useTheme, Theme } from '@mui/material/styles';

interface ChatProps {
  partnerId: string;
  partnerName: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const Chat: React.FC<ChatProps> = ({ partnerId, partnerName, messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll when messages change

  useEffect(() => {
    // Initial scroll to bottom when component mounts or partner changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [partnerId]); // Scroll when partner changes

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: '#1E1E1E',
      color: 'white',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: '#1E1E1E',
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ color: 'white' }}>{partnerName}</Typography>
      </Box>

      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: '#1E1E1E',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1E1E1E',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2A2A2A',
            borderRadius: '4px',
            '&:hover': {
              background: '#363636',
            },
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              alignSelf: message.uid === auth.currentUser?.uid ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              mb: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.uid === auth.currentUser?.uid ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: message.uid === auth.currentUser?.uid ? '#00FF7F' : '#2A2A2A',
                color: message.uid === auth.currentUser?.uid ? 'black' : 'white',
                mb: 0.5,
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9375rem',
                  lineHeight: 1.5,
                }}
              >
                {message.text}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                px: 1,
              }}
            >
              {new Date(message.createdAt?.toDate() || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          bgcolor: '#1E1E1E',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              bgcolor: '#2A2A2A',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00FF7F',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        />
        <IconButton 
          type="submit" 
          sx={{ 
            color: '#00FF7F',
            '&:hover': {
              bgcolor: 'rgba(0, 255, 127, 0.1)',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
