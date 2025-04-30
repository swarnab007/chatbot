import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import QuickActions from "./components/QuickActions";
import {
  getInitialMessages,
  processMessage,
  ChatState,
} from "./services/chatService";

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: getInitialMessages(),
    isLoading: false,
    context: {},
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message: string) => {
    setChatState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    try {
      const { newMessages, updatedContext } = await processMessage(
        message,
        chatState
      );

      setChatState((prevState) => ({
        messages: [...prevState.messages, ...newMessages],
        isLoading: false,
        context: updatedContext,
      }));
    } catch (error) {
      console.error("Error processing message:", error);

      setChatState((prevState) => ({
        ...prevState,
        isLoading: false,
        messages: [
          ...prevState.messages,
          {
            id: "error",
            text: "Sorry, I encountered an error. Please try again.",
            isBot: true,
            timestamp: new Date(),
          },
        ],
      }));
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        className="w-full max-w-4xl bg-gray-50 rounded-xl shadow-xl overflow-hidden flex flex-col h-[98vh] sm:h-[90vh]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header />

        <QuickActions onSelectAction={handleQuickAction} />

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-4">
          {chatState.messages.map((message) => (
            <ChatMessage
              key={message.id}
              text={message.text}
              isBot={message.isBot}
              flightData={message.flightData}
            />
          ))}

          {chatState.isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-lg p-3 flex space-x-2 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={chatState.isLoading}
        />
      </motion.div>
    </div>
  );
}

export default App;
