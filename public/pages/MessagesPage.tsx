import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getConversations } from '../services/api';
import { Conversation } from '../types';
import ConversationList from '../components/ConversationList';
import ConversationView from '../components/ConversationView';
import { Lucide } from '../components/Lucide';

const MessagesPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { conversationId } = useParams<{ conversationId: string }>();

    const fetchConversations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch conversations.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleSelectConversation = (id: string) => {
        navigate(`/messages/${id}`);
    };
    
    // Callback to refresh conversation list after a new message is sent
    const onNewMessage = () => {
        // Simple refetch, could be optimized later with websockets
        fetchConversations();
    }
    
    const selectedConversation = conversations.find(c => c.id === conversationId);

    return (
        <div className="container mx-auto py-8">
            <Lucide />
            <div className="bg-white rounded-lg shadow-xl h-[calc(100vh-200px)] flex">
                {/* Conversation List */}
                <div className={`
                    w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col
                    ${conversationId && 'hidden md:flex'}
                `}>
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold">Inbox</h2>
                    </div>
                    {loading ? (
                        <div className="flex-grow flex items-center justify-center"><div className="loader"></div></div>
                    ) : error ? (
                        <p className="p-4 text-red-500">{error}</p>
                    ) : (
                        <ConversationList
                            conversations={conversations}
                            selectedConversationId={conversationId}
                            onSelectConversation={handleSelectConversation}
                        />
                    )}
                </div>

                {/* Conversation View */}
                <div className={`
                    w-full md:w-2/3 lg:w-3/4 flex flex-col
                    ${!conversationId && 'hidden md:flex'}
                `}>
                    {conversationId ? (
                        <ConversationView 
                            key={conversationId} 
                            conversationId={conversationId} 
                            conversation={selectedConversation}
                            onNewMessage={onNewMessage}
                        />
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center p-4">
                            <div>
                                <i data-lucide="message-square" className="w-16 h-16 mx-auto text-gray-300"></i>
                                <h3 className="mt-4 text-xl font-semibold text-gray-700">Select a conversation</h3>
                                <p className="mt-1 text-gray-500">Choose from your existing conversations to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;