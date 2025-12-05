
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Check, Plus, Trash2, Sparkles, Bot } from 'lucide-react';
import { analyzeFoodWithGemini, fileToBase64 } from '../services/geminiService';
import { addLog, getChatHistory, saveChatHistory, getProfile, getLogs, clearChatHistory } from '../services/storageService';
import { ChatMessage, FoodItem, MealType } from '../types';

const FoodChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const history = getChatHistory();
    const profile = getProfile();
    
    if (history.length === 0) {
        const greeting = profile.language === 'id' 
            ? "Halo! Aku NutriTrack AI. Ceritakan apa yang kamu makan atau kirim fotonya ya. Aku juga bisa kasih tips kesehatan lho! 😊"
            : "Hi! I'm NutriTrack AI. Tell me what you ate or snap a photo. I can also give you health tips! 😊";

        setMessages([{
            id: 'welcome',
            role: 'assistant',
            text: greeting,
            timestamp: Date.now()
        }]);
    } else {
        setMessages(history);
    }
  }, []);

  // Save history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
        saveChatHistory(messages);
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearChat = () => {
      if(confirm("Clear chat history?")) {
        clearChatHistory();
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            text: "Chat cleared. Let's start fresh! 🌱",
            timestamp: Date.now()
        }]);
      }
  }

  const handleSend = async (text: string, imageBase64: string | null = null) => {
    if (!text.trim() && !imageBase64) return;

    const profile = getProfile();
    const todaysLogs = getLogs(new Date().toISOString().split('T')[0]);

    // 1. Add User Message
    const newUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text,
      image: imageBase64 || undefined,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // 2. Call AI with Context (History + Profile + Today's Logs)
      const aiResponse = await analyzeFoodWithGemini(
          imageBase64, 
          text, 
          updatedMessages, 
          profile,
          todaysLogs
      );
      
      // 3. Add AI Message
      const newAiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: aiResponse.message,
        timestamp: Date.now(),
        foodData: aiResponse.isFood && aiResponse.foodData ? {
            ...aiResponse.foodData,
            id: crypto.randomUUID(),
            image: imageBase64 || undefined,
            isAiGenerated: true
        } : undefined
      };
      setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: profile.language === 'id' 
            ? "Maaf, ada masalah koneksi. Coba lagi ya? 🙏" 
            : "Sorry, I had trouble connecting. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      handleSend("Analyze this image", base64);
    }
  };

  const logFood = (msgId: string, food: FoodItem, mealType: MealType) => {
    addLog({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        mealType: mealType,
        food: food
    });

    setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, isLogged: true } : m
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative bg-slate-50">
      
      {/* Chat Header Actions */}
      <div className="absolute top-2 right-4 z-10">
          <button onClick={handleClearChat} className="p-2 text-slate-300 hover:text-red-400 transition-colors bg-white/80 rounded-full backdrop-blur-sm shadow-sm">
              <Trash2 size={16} />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
            
            {/* Avatar for Assistant */}
            {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={18} className="text-white" />
                </div>
            )}

            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-br-none' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
            }`}>
                {msg.image && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                         <img src={`data:image/jpeg;base64,${msg.image}`} alt="uploaded" className="w-full h-auto max-h-60 object-cover" />
                    </div>
                )}
                
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                
                {/* Food Card Preview */}
                {msg.foodData && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-1">
                                    {msg.foodData.name}
                                    <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
                                </h4>
                                <p className="text-xs text-slate-500">{msg.foodData.portion}</p>
                            </div>
                            <div className="text-right bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                <span className="block font-bold text-blue-600">{msg.foodData.calories} kcal</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mb-4">
                            <div className="bg-white p-2 rounded-lg text-center border border-slate-100 shadow-sm">
                                <span className="block font-bold text-slate-800">{msg.foodData.protein}g</span>
                                <span className="text-[10px] text-slate-400">Protein</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg text-center border border-slate-100 shadow-sm">
                                <span className="block font-bold text-slate-800">{msg.foodData.carbs}g</span>
                                <span className="text-[10px] text-slate-400">Carbs</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg text-center border border-slate-100 shadow-sm">
                                <span className="block font-bold text-slate-800">{msg.foodData.fat}g</span>
                                <span className="text-[10px] text-slate-400">Fat</span>
                            </div>
                        </div>
                        
                        {!msg.isLogged ? (
                            <div className="flex gap-2 animate-fade-in">
                                <button 
                                    onClick={() => logFood(msg.id, msg.foodData!, MealType.LUNCH)} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200 hover:shadow-lg"
                                >
                                    <Plus size={18} /> Log This Meal
                                </button>
                            </div>
                        ) : (
                            <div className="bg-green-100 text-green-700 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-green-200">
                                <Check size={18} /> Saved to Dashboard
                            </div>
                        )}
                    </div>
                )}
                <span className={`text-[10px] absolute bottom-1 ${msg.role === 'user' ? 'left-2 text-slate-400' : 'right-2 text-slate-300'} opacity-70`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
          </div>
        ))}
        
        {loading && (
            <div className="flex justify-start items-end gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-500" size={18} />
                    <span className="text-slate-500 text-sm italic">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Upload Photo"
            >
                <ImageIcon size={22} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
            />
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask advice or track food..."
                className="flex-1 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
            />
            <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-full transition-all shadow-lg shadow-blue-200"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FoodChat;
