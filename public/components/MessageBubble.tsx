import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
    const alignment = isOwnMessage ? 'justify-end' : 'justify-start';
    const bubbleColor = isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800';
    const borderRadius = isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none';

    return (
        <div className={`flex ${alignment}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${bubbleColor} ${borderRadius}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;