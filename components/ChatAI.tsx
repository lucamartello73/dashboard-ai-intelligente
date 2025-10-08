'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, Monitor, Cpu, HardDrive, Zap, MessageSquare, Trash2, Download, Copy } from 'lucide-react';
import { ComputerManager, ComputerRecommendation } from '../lib/computerManager';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    computerRecommendations?: ComputerRecommendation[];
    taskType?: string;
    suggestions?: string[];
  };
}

interface ChatAIProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatAI({ isOpen, onClose }: ChatAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Messaggio di benvenuto
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Ciao! Sono il tuo assistente AI personale. Posso aiutarti con:

🖥️ **Suggerimenti sui computer** - Quale dei tuoi 3 computer usare per un task specifico
💡 **Brainstorming** - Sviluppare e migliorare le tue idee
🔧 **Ottimizzazione workflow** - Migliorare i tuoi metodi di lavoro
📊 **Analisi strategie** - Verificare e perfezionare i tuoi approcci

Dimmi cosa stai lavorando o su cosa vorresti confrontarti!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simula chiamata API per risposta AI
      const aiResponse = await generateAIResponse(inputMessage.trim());
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: aiResponse.metadata
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'Mi dispiace, ho avuto un problema nel processare la tua richiesta. Riprova tra poco.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<{
    content: string;
    metadata?: ChatMessage['metadata'];
  }> => {
    // Simula delay API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const input = userInput.toLowerCase();
    let response = '';
    let metadata: ChatMessage['metadata'] = {};

    // Rilevamento richieste sui computer
    if (input.includes('computer') || input.includes('schermo') || input.includes('quale usare')) {
      const computers = ComputerManager.getActiveComputers();
      const recommendations = ComputerManager.getRecommendationForTask('generico', userInput);
      
      response = `Basandomi sui tuoi 3 computer Windows 11, ecco i miei suggerimenti:

🏆 **Computer consigliato**: ${recommendations[0]?.nomeComputer}
${recommendations[0]?.motivazione}

**Configurazione suggerita**: ${recommendations[0]?.configurazioneSuggerita}

**Vantaggi**:
${recommendations[0]?.vantaggi.map(v => `• ${v}`).join('\n')}

Vuoi che analizzi più nel dettaglio quale computer usare per un task specifico?`;

      metadata.computerRecommendations = recommendations;
    }
    // Rilevamento richieste di brainstorming
    else if (input.includes('brainstorm') || input.includes('idea') || input.includes('strategia')) {
      response = `Perfetto! Facciamo brainstorming insieme. 🧠

Per aiutarti al meglio, dimmi:
1. **Qual è l'obiettivo principale** del progetto?
2. **Quali risorse** hai a disposizione?
3. **Ci sono vincoli** di tempo o budget?
4. **Hai già provato** qualche approccio?

Posso aiutarti a:
• Generare nuove idee e approcci
• Identificare potenziali problemi
• Suggerire strumenti e metodologie
• Ottimizzare il tuo workflow

Raccontami di più del progetto!`;

      metadata.suggestions = [
        'Analizza obiettivi e vincoli',
        'Identifica risorse disponibili',
        'Valuta approcci alternativi',
        'Pianifica milestone e metriche'
      ];
    }
    // Rilevamento richieste di ottimizzazione workflow
    else if (input.includes('workflow') || input.includes('metodo') || input.includes('ottimizzare')) {
      response = `Ottimo! L'ottimizzazione del workflow è fondamentale. 🚀

**Aree di miglioramento comuni**:
• **Setup multi-monitor**: Sfruttare al meglio i tuoi 4, 3 e 1 schermi
• **Automazione task ripetitivi**: Script e shortcut
• **Gestione tempo**: Tecniche di time-blocking
• **Organizzazione digitale**: File, cartelle, bookmark

**Per darti consigli specifici**, dimmi:
1. Quale parte del tuo workflow ti rallenta di più?
2. Che tipo di lavoro fai principalmente?
3. Quali strumenti usi quotidianamente?

Con i tuoi 3 computer possiamo creare un sistema molto efficiente!`;

      metadata.suggestions = [
        'Analizza bottleneck attuali',
        'Implementa automazioni',
        'Ottimizza setup multi-monitor',
        'Standardizza processi'
      ];
    }
    // Rilevamento task specifici
    else if (input.includes('sviluppo') || input.includes('codice') || input.includes('programmazione')) {
      const recommendations = ComputerManager.getRecommendationForTask('sviluppo', userInput);
      
      response = `Per lo sviluppo, ti consiglio il **${recommendations[0]?.nomeComputer}**! 💻

**Perché è ideale**:
• ${recommendations[0]?.vantaggi.join('\n• ')}

**Setup ottimale per coding**:
• **Schermo principale**: IDE/Editor
• **Schermo secondario**: Browser per testing
• **Schermo terziario**: Documentazione/Stack Overflow
• **Schermo aggiuntivo**: Terminal/Git/Task manager

**Strumenti consigliati**:
• VS Code con estensioni multi-monitor
• Windows Terminal con tab multipli
• Git GUI per visualizzazione branch
• Postman per API testing

Che tipo di progetto stai sviluppando?`;

      metadata.computerRecommendations = recommendations;
      metadata.taskType = 'sviluppo';
    }
    else if (input.includes('design') || input.includes('grafica') || input.includes('creatività')) {
      const recommendations = ComputerManager.getRecommendationForTask('design', userInput);
      
      response = `Per il design, il **${recommendations[0]?.nomeComputer}** è perfetto! 🎨

**Setup creativo ottimale**:
• **Schermo principale**: Software di design (Photoshop, Figma, etc.)
• **Schermo secondario**: Riferimenti e ispirazioni
• **Schermo aggiuntivo**: Palette colori e asset
• **Schermo extra**: Client feedback e comunicazione

**Vantaggi del tuo setup**:
${recommendations[0]?.vantaggi.map(v => `• ${v}`).join('\n')}

**Workflow suggerito**:
1. Ricerca e mood board su schermo laterale
2. Design principale su schermo centrale
3. Preview e test su schermo aggiuntivo

Su cosa stai lavorando?`;

      metadata.computerRecommendations = recommendations;
      metadata.taskType = 'design';
    }
    // Risposta generica intelligente
    else {
      const responses = [
        `Interessante! Dimmi di più su questo argomento. Come posso aiutarti a sviluppare meglio questa idea?`,
        `Capisco. Per darti il miglior supporto, potresti fornirmi più dettagli? Così posso suggerirti l'approccio più efficace.`,
        `Ottima domanda! Basandomi sulla tua configurazione con 3 computer Windows 11, posso aiutarti a ottimizzare il tuo approccio. Raccontami di più.`,
        `Perfetto! Sono qui per aiutarti. Che aspetto specifico vorresti approfondire o migliorare?`
      ];
      
      response = responses[Math.floor(Math.random() * responses.length)];
      
      metadata.suggestions = [
        'Fornisci più dettagli sul progetto',
        'Specifica gli obiettivi principali',
        'Descrivi le sfide attuali',
        'Condividi il contesto di lavoro'
      ];
    }

    return { content: response, metadata };
  };

  const clearChat = () => {
    setMessages([]);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type === 'user' ? 'Tu' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-ai-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Potresti aggiungere un toast di conferma qui
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chat AI Assistant</h3>
              <p className="text-sm text-gray-500">Brainstorming e suggerimenti personalizzati</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportChat}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Esporta chat"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Pulisci chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Computer Recommendations */}
                  {message.metadata?.computerRecommendations && (
                    <div className="mt-3 space-y-2">
                      {message.metadata.computerRecommendations.slice(0, 3).map((rec, index) => (
                        <div key={rec.computerId} className="bg-white bg-opacity-10 rounded p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{rec.nomeComputer}</span>
                            <span className="text-xs opacity-75">Score: {rec.score}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.metadata?.suggestions && (
                    <div className="mt-3">
                      <div className="text-xs opacity-75 mb-1">💡 Suggerimenti:</div>
                      <div className="space-y-1">
                        {message.metadata.suggestions.map((suggestion, index) => (
                          <div key={index} className="text-xs bg-white bg-opacity-10 rounded px-2 py-1">
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.type === 'ai' && (
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                        title="Copia messaggio"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Scrivi il tuo messaggio... (es. 'Quale computer usare per sviluppo?')"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Invia</span>
            </button>
          </div>
          
          {/* Quick suggestions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              'Quale computer usare per sviluppo?',
              'Aiutami con il brainstorming',
              'Come ottimizzare il mio workflow?',
              'Setup ideale per design grafico'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
