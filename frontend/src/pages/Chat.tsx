import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Fade,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  Send as SendIcon, 
  Person as UserIcon, 
  SmartToy as BotIcon,
  InsertEmoticon as EmojiIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { chatApi } from '../services/api';
import { Message, ChatRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface ChatForm {
  message: string;
}

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatForm>();

  // Load messages if conversationId is provided
  const { data: conversationMessages, isLoading } = useQuery(
    ['conversationMessages', conversationId],
    () => chatApi.getConversationMessages(Number(conversationId)),
    {
      enabled: !!conversationId,
      onSuccess: (response) => {
        setMessages(response.data);
      },
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(chatApi.sendMessage, {
    onSuccess: (response) => {
      const { response: botResponse } = response.data;
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      queryClient.invalidateQueries('conversations');
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const onSubmit = async (data: ChatForm) => {
    if (!data.message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: data.message,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    reset();

    const chatRequest: ChatRequest = {
      message: data.message,
      conversation_id: conversationId ? Number(conversationId) : undefined,
    };

    await sendMessageMutation.mutateAsync(chatRequest);
  };

  // Handle Enter key press for sending message
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (isLoading) {
    return <LoadingSpinner message="Loading conversation..." />;
  }

  return (
    <Box sx={{ 
      height: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#1a1a1a',
      borderRadius: isMobile ? 0 : 2,
      overflow: 'hidden',
      border: isMobile ? 'none' : '1px solid #444',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? '60px' : 'auto',
      left: isMobile ? 0 : 'auto',
      right: isMobile ? 0 : 'auto',
      bottom: isMobile ? 0 : 'auto',
      zIndex: isMobile ? 40 : 'auto'
    }}>
      {/* Modern Header */}
      <Box sx={{ 
        background: '#2a2a2a', 
        p: isMobile ? 2 : 3,
        borderBottom: '1px solid #444'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(229,229,229,0.2)', 
            color: '#e5e5e5',
            width: isMobile ? 32 : 40,
            height: isMobile ? 32 : 40
          }}>
            <BotIcon sx={{ fontSize: isMobile ? 18 : 24 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h5"} 
              sx={{ color: '#e5e5e5', fontWeight: 600 }}
            >
              AI Assistant
            </Typography>
            {!isMobile && (
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Powered by GPT-4 with document knowledge
              </Typography>
            )}
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="Online" 
                color="success" 
                size="small" 
                sx={{ bgcolor: '#4caf50', color: 'white' }}
              />
              <Chip 
                label={`${messages.length} messages`} 
                variant="outlined" 
                size="small" 
                sx={{ color: '#e5e5e5', borderColor: '#666' }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Chat Messages Area */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#1a1a1a',
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 3,
          boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0,0,0,0.3)',
          border: isMobile ? 'none' : '1px solid #444',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: isMobile ? 2 : 3 }}>
          {messages.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height="100%"
              gap={2}
            >
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#667eea' }}>
                <BotIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ color: '#e5e5e5' }} textAlign="center">
                Welcome to AI Chat!
              </Typography>
              <Typography variant="body1" sx={{ color: '#b0b0b0' }} textAlign="center">
                Start a conversation by typing a message below. I can help you with questions based on uploaded documents.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip label="Ask about services" variant="outlined" size="small" sx={{ color: '#e5e5e5', borderColor: '#666' }} />
                <Chip label="Get information" variant="outlined" size="small" sx={{ color: '#e5e5e5', borderColor: '#666' }} />
                <Chip label="Document search" variant="outlined" size="small" sx={{ color: '#e5e5e5', borderColor: '#666' }} />
              </Box>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {messages.map((message, index) => (
                <Fade in key={message.id} timeout={300}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      mb: 2,
                      px: 0,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: message.role === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        ml: message.role === 'user' ? 2 : 0,
                        mr: message.role === 'user' ? 0 : 2,
                        width: 40,
                        height: 40,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      {message.role === 'user' ? <UserIcon /> : <BotIcon />}
                    </Avatar>
                    <Box
                      sx={{
                        maxWidth: '75%',
                        bgcolor: message.role === 'user' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#2a2a2a',
                        color: message.role === 'user' ? 'white' : '#e5e5e5',
                        borderRadius: message.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                        p: 2.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        position: 'relative',
                        border: message.role === 'user' ? 'none' : '1px solid #444',
                        '&:before': message.role === 'user' ? {} : {
                          content: '""',
                          position: 'absolute',
                          left: -8,
                          top: 12,
                          width: 0,
                          height: 0,
                          borderTop: '8px solid transparent',
                          borderRight: '8px solid #2a2a2a',
                          borderBottom: '8px solid transparent',
                        }
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {message.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          mt: 1, 
                          display: 'block',
                          textAlign: message.role === 'user' ? 'right' : 'left'
                        }}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </ListItem>
                </Fade>
              ))}
              {isTyping && (
                <Fade in timeout={300}>
                  <ListItem sx={{ alignItems: 'flex-start', mb: 2, px: 0 }}>
                    <Avatar sx={{ 
                      bgcolor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                      mr: 2,
                      width: 40,
                      height: 40,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                      <BotIcon />
                    </Avatar>
                    <Box
                      sx={{
                        bgcolor: '#2a2a2a',
                        borderRadius: '20px 20px 20px 5px',
                        p: 2.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        position: 'relative',
                        border: '1px solid #444',
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          left: -8,
                          top: 12,
                          width: 0,
                          height: 0,
                          borderTop: '8px solid transparent',
                          borderRight: '8px solid #2a2a2a',
                          borderBottom: '8px solid transparent',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#667eea',
                          animation: 'bounce 1.4s ease-in-out infinite both'
                        }} />
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#667eea',
                          animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
                        }} />
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#667eea',
                          animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
                        }} />
                        <Typography variant="body2" sx={{ ml: 1, color: '#b0b0b0' }}>
                          AI is typing...
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </Fade>
              )}
            </List>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Modern Input Area */}
        <Box sx={{ 
          p: isMobile ? 1.5 : 3, 
          borderTop: '1px solid #444',
          background: '#2a2a2a',
        }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                placeholder={isMobile ? "Message..." : "Type your message here... (Press Enter to send, Shift+Enter for new line)"}
                multiline
                maxRows={isMobile ? 3 : 4}
                {...register('message', {
                  required: 'Message is required',
                })}
                onKeyPress={handleKeyPress}
                error={!!errors.message}
                helperText={errors.message?.message}
                disabled={sendMessageMutation.isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: isMobile ? 20 : 6,
                    bgcolor: '#1a1a1a',
                    color: '#e5e5e5',
                    border: '1px solid #444',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    '&:hover': {
                      borderColor: '#666',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    },
                    '&.Mui-focused': {
                      borderColor: '#667eea',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 2 : 1.5,
                    color: '#e5e5e5',
                    '&::placeholder': {
                      color: '#888',
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ff6b6b',
                  }
                }}
                InputProps={{
                  endAdornment: !isMobile ? (
                    <InputAdornment position="end">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" disabled={sendMessageMutation.isLoading} sx={{ color: '#888' }}>
                          <EmojiIcon />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ) : undefined,
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={sendMessageMutation.isLoading}
                sx={{
                  minWidth: isMobile ? 44 : 60,
                  width: isMobile ? 44 : 60,
                  height: isMobile ? 44 : 56,
                  borderRadius: isMobile ? '50%' : 6,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <SendIcon sx={{ fontSize: isMobile ? 18 : 24 }} />
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </Box>
  );
};

export default Chat;