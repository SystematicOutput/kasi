import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessagesForConversation, sendMessageInConversation } from '../services/api';
import { Message, Conversation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import MessageBubble from './MessageBubble';

interface ConversationViewProps {
    conversationId: string;
    conversation?: Conversation;
    onNewMessage: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId, conversation, onNewMessage }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const { userProfile } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const data = await getMessagesForConversation(conversationId);
                setMessages(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch messages.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !userProfile) return;

        try {
            const sentMessage = await sendMessageInConversation(conversationId, newMessage);
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            onNewMessage(); // Notify parent to refresh conversation list
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally show an error to the user
        }
    };

    return (
        <div className="flex-grow flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                 <button onClick={() => navigate('/messages')} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <i data-lucide="arrow-left" className="w-5 h-5"></i>
                </button>
                <img 
                    src={conversation?.participantImageUrl || `https://ui-avatars.com/api/?name=${conversation?.participantEmail}&background=random`} 
                    alt={conversation?.participantEmail}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <h3 className="font-bold text-lg">{conversation?.participantEmail}</h3>
                    {conversation?.listingTitle && <p className="text-sm text-gray-500">Regarding: {conversation.listingTitle}</p>}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading && <p className="text-center">Loading messages...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === userProfile?.uid} />
                ))}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors">
                        <i data-lucide="send" className="w-5 h-5"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConversationView;