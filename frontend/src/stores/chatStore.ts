import { create } from 'zustand';
import { chatApi } from '@/services/api';
import { Conversation, Message, ChatRequest, ChatResponse } from '@/types';
import toast from 'react-hot-toast';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isMessageLoading: boolean;
  
  // Actions
  loadConversations: () => Promise<void>;
  createConversation: (title: string) => Promise<Conversation>;
  selectConversation: (id: number) => Promise<void>;
  sendMessage: (request: ChatRequest) => Promise<ChatResponse>;
  loadMessages: (conversationId: number) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  clearCurrentConversation: () => void;
  setLoading: (loading: boolean) => void;
  setMessageLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isMessageLoading: false,

  loadConversations: async () => {
    try {
      set({ isLoading: true });
      const response = await chatApi.getConversations();
      set({ conversations: response.data });
    } catch (error: any) {
      console.error('Load conversations error:', error);
      toast.error('Failed to load conversations');
    } finally {
      set({ isLoading: false });
    }
  },

  createConversation: async (title: string) => {
    try {
      const response = await chatApi.createConversation(title);
      const newConversation = response.data;
      
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
        messages: [],
      }));
      
      return newConversation;
    } catch (error: any) {
      console.error('Create conversation error:', error);
      toast.error('Failed to create conversation');
      throw error;
    }
  },

  selectConversation: async (id: number) => {
    try {
      const conversation = get().conversations.find(conv => conv.id === id);
      if (!conversation) {
        toast.error('Conversation not found');
        return;
      }

      set({ currentConversation: conversation });
      await get().loadMessages(id);
    } catch (error: any) {
      console.error('Select conversation error:', error);
      toast.error('Failed to load conversation');
    }
  },

  sendMessage: async (request: ChatRequest) => {
    try {
      set({ isMessageLoading: true });
      
      const response = await chatApi.sendMessage(request);
      const chatResponse = response.data;
      
      // Add both user message and AI response to messages
      set((state) => ({
        messages: [...state.messages, chatResponse.message, chatResponse.response],
        currentConversation: state.currentConversation ? {
          ...state.currentConversation,
          id: chatResponse.conversation_id
        } : null,
      }));

      // If this is a new conversation, add it to the conversations list
      const existingConversation = get().conversations.find(
        conv => conv.id === chatResponse.conversation_id
      );
      
      if (!existingConversation && get().currentConversation) {
        const updatedConversation = {
          ...get().currentConversation!,
          id: chatResponse.conversation_id,
        };
        
        set((state) => ({
          conversations: [updatedConversation, ...state.conversations.filter(c => c.id !== updatedConversation.id)],
          currentConversation: updatedConversation,
        }));
      }
      
      return chatResponse;
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      throw error;
    } finally {
      set({ isMessageLoading: false });
    }
  },

  loadMessages: async (conversationId: number) => {
    try {
      set({ isLoading: true });
      const response = await chatApi.getConversationMessages(conversationId);
      set({ messages: response.data });
    } catch (error: any) {
      console.error('Load messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteConversation: async (id: number) => {
    try {
      await chatApi.deleteConversation(id);
      
      set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
        messages: state.currentConversation?.id === id ? [] : state.messages,
      }));
      
      toast.success('Conversation deleted');
    } catch (error: any) {
      console.error('Delete conversation error:', error);
      toast.error('Failed to delete conversation');
    }
  },

  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      messages: [],
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setMessageLoading: (loading: boolean) => {
    set({ isMessageLoading: loading });
  },
}));