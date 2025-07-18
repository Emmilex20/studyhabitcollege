// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MdChat } from 'react-icons/md'; // Example icon from react-icons/md
import './Chatbot.css'; // We'll create this CSS file next

// Define Message interface for type safety
interface Message {
    text: string;
    sender: 'user' | 'bot' | 'bot error';
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const newUserMessage: Message = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setInput('');

        try {
            // Replace with your backend URL.
            // In a production environment, you'd likely use a relative path like '/api/chatbot/message'
            // or an environment variable for the full URL.
            const response = await fetch('https://studyhabitcollege.onrender.com/api/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add your authentication token if the route is protected
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: { reply: string } = await response.json(); // Type assertion for response data
            const botReply: Message = { text: data.reply, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botReply]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) { 
            console.error('Error sending message to chatbot:', error);
            const errorMessage: Message = { text: 'Sorry, I am having trouble connecting. Please try again later.', sender: 'bot error' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chatbot Icon */}
            <div className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
                <MdChat size={30} color="white" />
            </div>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>AI Chatbot</h3>
                        <button onClick={() => setIsOpen(false)} className="close-btn">X</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                    </div>
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;