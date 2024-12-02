import React, { useState, useRef, useCallback, useEffect, FormEvent } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { auth } from '../firebase';
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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll when messages change

  useEffect(() => {
    // Initial scroll to bottom when component mounts
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []); // Empty dependency array for mount only

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
      overflow: 'hidden',
      bgcolor: 'background.default',
      borderRadius: '4px',
      border: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h6">{partnerName}</Typography>
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
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              alignSelf: message.uid === auth.currentUser?.uid ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              mb: 1,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: '4px',
                bgcolor: message.uid === auth.currentUser?.uid 
                  ? 'primary.main' 
                  : (theme: Theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                color: message.uid === auth.currentUser?.uid 
                  ? 'primary.contrastText' 
                  : 'text.primary',
                border: message.uid === auth.currentUser?.uid 
                  ? 'none' 
                  : (theme: Theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
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
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                  fontSize: '0.75rem',
                  textAlign: message.uid === auth.currentUser?.uid ? 'right' : 'left',
                }}
              >
                {message.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 1,
          p: 2,
          borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }
          }}
        />
        <IconButton 
          type="submit"
          color="primary"
          sx={{
            borderRadius: '4px',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
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
