import React from 'react';
import { Conversation } from '../types';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId?: string;
    onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
    
    const truncate = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    if (conversations.length === 0) {
        return <p className="p-4 text-gray-500">No conversations yet.</p>;
    }

    return (
        <div className="flex-grow overflow-y-auto">
            {conversations.map(convo => (
                <button
                    key={convo.id}
                    onClick={() => onSelectConversation(convo.id)}
                    className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                        convo.id === selectedConversationId ? 'bg-blue-50' : ''
                    }`}
                >
                    <img 
                        src={convo.participantImageUrl || `https://ui-avatars.com/api/?name=${convo.participantEmail}&background=random`} 
                        alt={convo.participantEmail}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold truncate">{convo.participantEmail}</h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                                {new Date(convo.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                            {truncate(convo.lastMessage || 'No messages yet.', 40)}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ConversationList;