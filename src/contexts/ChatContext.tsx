"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ChatSession, Message, UserProfile } from '@/types/chat';

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'CLEAR_STATE' };

const initialState: ChatState = {
  sessions: [],
  currentSession: null,
  messages: [],
  userProfile: null,
  isLoading: false,
  error: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };
    
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    
    case 'ADD_SESSION':
      return { 
        ...state, 
        sessions: [action.payload, ...state.sessions] 
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        ),
        currentSession: state.currentSession?.id === action.payload.id
          ? { ...state.currentSession, ...action.payload.updates }
          : state.currentSession,
      };
    
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
        currentSession: state.currentSession?.id === action.payload
          ? null
          : state.currentSession,
      };
    
    case 'CLEAR_STATE':
      return initialState;
    
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  clearError: () => void;
  clearState: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' });
  }, []);

  const value: ChatContextType = {
    state,
    dispatch,
    clearError,
    clearState,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
