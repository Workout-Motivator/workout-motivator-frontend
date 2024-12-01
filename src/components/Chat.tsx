import React, { useState, useRef, useCallback, useEffect, FormEvent } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { auth } from '../firebase';
import { ChatMessage } from '../types/chat';

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
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const previousMessageCount = useRef(messages.length);

  const scrollToBottom = useCallback(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldScrollToBottom]);

  // Handle scroll events to track if user is at bottom
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      setShouldScrollToBottom(isAtBottom);
    }
  }, []);

  // Effect for handling new messages and scrolling
  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.uid === auth.currentUser?.uid;
      
      if (isOwnMessage || shouldScrollToBottom) {
        scrollToBottom();
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      setShouldScrollToBottom(true);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">{partnerName}</Typography>
      </Box>

      <Box
        ref={chatContainerRef}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
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
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1,
                bgcolor: message.uid === auth.currentUser?.uid ? 'primary.main' : 'grey.100',
                color: message.uid === auth.currentUser?.uid ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {message.createdAt?.toDate().toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          autoComplete="off"
        />
        <IconButton type="submit">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
