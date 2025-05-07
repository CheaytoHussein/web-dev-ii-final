import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "driver";
  timestamp: Date;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId?: string;
  driverName?: string;
  driverAvatar?: string;
}

const LiveChat = ({
  isOpen,
  onClose,
  deliveryId = "",
  driverName = "Driver",
  driverAvatar = "",
}: LiveChatProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading previous messages for this delivery
    if (deliveryId) {
      // These would come from your API in a real application
      const mockPreviousMessages: Message[] = [
        {
          id: "1",
          text: `Hi! I'm your driver for delivery ${deliveryId.slice(0, 8)}`,
          sender: "driver",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          id: "2",
          text: "I'll be there in about 20 minutes",
          sender: "driver",
          timestamp: new Date(Date.now() - 58 * 60 * 1000),
        },
        {
          id: "3",
          text: "Great! Please call when you arrive",
          sender: "user",
          timestamp: new Date(Date.now() - 56 * 60 * 1000),
        },
      ];
      
      setMessages(mockPreviousMessages);
    }
  }, [deliveryId]);

  useEffect(() => {
    // Scroll to the bottom when messages change or when chat opens
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    
    // Simulate driver response after a delay
    setTimeout(() => {
      const driverResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getRandomResponse(),
        sender: "driver",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, driverResponse]);
    }, 2000);
  };

  const getRandomResponse = () => {
    const responses = [
      "I'll be there shortly!",
      "Got it, thanks for the update.",
      "No problem, I'll take care of that.",
      "I'm on my way now.",
      "Is there anything else you need?",
      "Please be ready with the package.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 shadow-lg rounded-lg bg-background border flex flex-col overflow-hidden" style={{ height: "500px" }}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-primary/10">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={driverAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {driverName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{driverName}</p>
            <p className="text-xs text-muted-foreground">
              {deliveryId ? `Delivery #${deliveryId.slice(0, 8)}` : 'Chat'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as any}>
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="ml-2">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default LiveChat;