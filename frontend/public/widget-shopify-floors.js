/**
 * Shopify Floors Installer - AI Chatbot Widget 
 * Auto-detects tenant based on domain
 * 
 * Usage: <script src="https://ai-chatbot-rize-corsorigins.up.railway.app/widget-shopify-floors.js"></script>
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        API_BASE: 'https://ai-chatbot-rize-corsorigins-7c54.up.railway.app',
        DOMAIN: window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
        BRAND_COLOR: '#2563eb',
        BRAND_NAME: 'Floors Installer Pro'
    };
    
    let currentTenant = null;
    let chatContainer = null;
    let isOpen = false;
    let isInitialized = false;
    
    // Detect tenant by domain
    async function detectTenant() {
        try {
            const response = await fetch(`${CONFIG.API_BASE}/api/tenant/detect?domain=${encodeURIComponent(CONFIG.DOMAIN)}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.tenant) {
                currentTenant = data.tenant;
                console.log('✅ Tenant detected:', currentTenant.name);
                return true;
            } else {
                console.warn('⚠️ No tenant found for domain:', CONFIG.DOMAIN);
                return false;
            }
        } catch (error) {
            console.error('❌ Error detecting tenant:', error);
            return false;
        }
    }
    
    // Send message to chat API
    async function sendMessage(message) {
        if (!currentTenant) {
            return {
                response: "Error: No se pudo detectar la configuración del asistente para este dominio.",
                sources: []
            };
        }
        
        try {
            const response = await fetch(`${CONFIG.API_BASE}/api/chat/by-domain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    domain: CONFIG.DOMAIN
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    response: data.response,
                    sources: data.sources || [],
                    rag_used: data.rag_used || false
                };
            } else {
                return {
                    response: data.response || "Error en el sistema. Intenta de nuevo.",
                    sources: []
                };
            }
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                response: "Error de conexión. Por favor, intenta de nuevo.",
                sources: []
            };
        }
    }
    
    // Create chat widget HTML
    function createChatWidget() {
        const widgetHTML = `
            <div id="floors-chatbot-container" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <!-- Chat Toggle Button -->
                <div id="floors-chat-toggle" style="
                    width: 60px;
                    height: 60px;
                    background: ${CONFIG.BRAND_COLOR};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                </div>
                
                <!-- Chat Window -->
                <div id="floors-chat-window" style="
                    display: none;
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                ">
                    <!-- Chat Header -->
                    <div style="
                        background: ${CONFIG.BRAND_COLOR};
                        color: white;
                        padding: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <div>
                            <div style="font-weight: 600; font-size: 14px;">${CONFIG.BRAND_NAME}</div>
                            <div style="font-size: 12px; opacity: 0.9;" id="floors-tenant-status">Conectando...</div>
                        </div>
                        <div id="floors-chat-close" style="
                            cursor: pointer;
                            opacity: 0.8;
                            padding: 5px;
                        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <!-- Chat Messages -->
                    <div id="floors-chat-messages" style="
                        height: 380px;
                        overflow-y: auto;
                        padding: 15px;
                        background: #f8fafc;
                    ">
                        <div style="
                            background: white;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 10px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        ">
                            <div style="font-size: 14px; color: #374151;">
                                ¡Hola! Soy el asistente de <strong>${CONFIG.BRAND_NAME}</strong>. 
                                ¿En qué puedo ayudarte con la instalación de pisos?
                            </div>
                        </div>
                    </div>
                    
                    <!-- Chat Input -->
                    <div style="
                        padding: 15px;
                        border-top: 1px solid #e5e7eb;
                        background: white;
                    ">
                        <div style="display: flex; gap: 8px;">
                            <input 
                                id="floors-chat-input" 
                                type="text" 
                                placeholder="Escribe tu mensaje..."
                                style="
                                    flex: 1;
                                    padding: 10px 12px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 6px;
                                    outline: none;
                                    font-size: 14px;
                                "
                                onkeypress="if(event.key==='Enter') document.getElementById('floors-send-btn').click()"
                            >
                            <button 
                                id="floors-send-btn"
                                style="
                                    background: ${CONFIG.BRAND_COLOR};
                                    color: white;
                                    border: none;
                                    padding: 10px 15px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                "
                                onmouseover="this.style.opacity='0.9'"
                                onmouseout="this.style.opacity='1'"
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Add event listeners
        document.getElementById('floors-chat-toggle').addEventListener('click', toggleChat);
        document.getElementById('floors-chat-close').addEventListener('click', closeChat);
        document.getElementById('floors-send-btn').addEventListener('click', handleSendMessage);
        
        chatContainer = document.getElementById('floors-chatbot-container');
    }
    
    function toggleChat() {
        const chatWindow = document.getElementById('floors-chat-window');
        if (isOpen) {
            closeChat();
        } else {
            chatWindow.style.display = 'block';
            isOpen = true;
            document.getElementById('floors-chat-input').focus();
        }
    }
    
    function closeChat() {
        const chatWindow = document.getElementById('floors-chat-window');
        chatWindow.style.display = 'none';
        isOpen = false;
    }
    
    function addMessage(message, isUser = false) {
        const messagesContainer = document.getElementById('floors-chat-messages');
        const messageDiv = document.createElement('div');
        
        messageDiv.style.cssText = `
            background: ${isUser ? CONFIG.BRAND_COLOR : 'white'};
            color: ${isUser ? 'white' : '#374151'};
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            margin-left: ${isUser ? '20px' : '0'};
            margin-right: ${isUser ? '0' : '20px'};
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        `;
        
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    async function handleSendMessage() {
        const input = document.getElementById('floors-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        input.value = '';
        
        // Add typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.style.cssText = `
            background: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            margin-right: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
        `;
        typingDiv.textContent = 'Escribiendo...';
        
        const messagesContainer = document.getElementById('floors-chat-messages');
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        try {
            const result = await sendMessage(message);
            
            // Remove typing indicator
            document.getElementById('typing-indicator')?.remove();
            
            // Add bot response
            addMessage(result.response);
            
            // Show sources if available
            if (result.sources && result.sources.length > 0) {
                const sourcesText = `📋 Información basada en: ${result.sources.map(s => s.filename).join(', ')}`;
                addMessage(sourcesText);
            }
            
        } catch (error) {
            document.getElementById('typing-indicator')?.remove();
            addMessage('Error: No se pudo procesar tu mensaje. Intenta de nuevo.');
        }
    }
    
    // Update tenant status
    function updateTenantStatus() {
        const statusElement = document.getElementById('floors-tenant-status');
        if (statusElement) {
            if (currentTenant) {
                statusElement.textContent = `Conectado: ${currentTenant.name}`;
            } else {
                statusElement.textContent = 'Error de conexión';
            }
        }
    }
    
    // Initialize widget
    async function initWidget() {
        if (isInitialized) return;
        
        console.log('🚀 Initializing Floors Installer Chatbot...');
        console.log('Domain:', CONFIG.DOMAIN);
        
        // Detect tenant first
        const tenantDetected = await detectTenant();
        
        // Create widget
        createChatWidget();
        
        // Update status
        updateTenantStatus();
        
        if (tenantDetected) {
            console.log('✅ Floors Installer Chatbot initialized successfully');
        } else {
            console.warn('⚠️ Chatbot initialized but tenant detection failed');
        }
        
        isInitialized = true;
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
    
    // Expose global functions if needed
    window.FloorsInstallerChatbot = {
        init: initWidget,
        open: () => { if (!isOpen) toggleChat(); },
        close: closeChat,
        getTenant: () => currentTenant
    };
    
})();