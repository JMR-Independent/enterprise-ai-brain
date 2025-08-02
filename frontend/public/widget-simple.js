(function() {
  window.AIChatbot = {
    init: function(config) {
      // Función para esperar DOM
      function waitForDOM(callback) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', callback);
        } else {
          setTimeout(callback, 1000);
        }
      }

      // Función para crear el chatbot
      function createChatbot() {
        try {
          // Eliminar chatbots existentes
          const existing = document.querySelectorAll('#ai-chatbot-button, #ai-chatbot-window');
          existing.forEach(el => {
            try {
              el.remove();
            } catch (e) {
              console.log('Element already removed');
            }
          });

          let conversationId = 'web-chat-' + Date.now();

          // Crear contenedor principal
          const chatContainer = document.createElement('div');
          
          // Añadir estilos CSS
          const style = document.createElement('style');
          style.textContent = `
            @keyframes pulse-glow {
              0%, 100% { 
                box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4), 0 4px 10px rgba(0,0,0,0.1), 0 0 0 0 rgba(139, 69, 19, 0.4); 
              }
              50% { 
                box-shadow: 0 8px 25px rgba(139, 69, 19, 0.6), 0 4px 10px rgba(0,0,0,0.1), 0 0 0 10px rgba(139, 69, 19, 0.1); 
              }
            }
            
            @keyframes bounce-icon {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-4px); }
              60% { transform: translateY(-2px); }
            }
            
            @keyframes slideInUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes messageSlideIn {
              from { transform: translateX(-20px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes typing-dots {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-10px); }
            }
            
            #chat-messages::-webkit-scrollbar {
              width: 6px;
            }
            
            #chat-messages::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.05);
              border-radius: 3px;
            }
            
            #chat-messages::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F);
              border-radius: 3px;
              transition: all 0.2s ease;
            }
            
            #chat-messages::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #CD853F, ${config.primaryColor || '#8B4513'});
            }
          `;
          document.head.appendChild(style);
          
          chatContainer.innerHTML = `
            <!-- Botón del chatbot -->
            <div id="ai-chatbot-button" style="
              position: fixed;
              bottom: 25px;
              right: 25px;
              width: 70px;
              height: 70px;
              background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #A0522D, #CD853F);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 28px;
              cursor: pointer;
              box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4), 0 4px 10px rgba(0,0,0,0.1);
              z-index: 999999;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              border: 3px solid rgba(255,255,255,0.2);
              backdrop-filter: blur(10px);
              animation: pulse-glow 3s infinite ease-in-out;
            ">
              <div style="display: flex; align-items: center; justify-content: center; animation: bounce-icon 2s infinite;">
                🎨
              </div>
            </div>
            
            <!-- Ventana del chat -->
            <div id="ai-chatbot-window" style="
              position: fixed;
              bottom: 110px;
              right: 25px;
              width: 380px;
              height: 500px;
              background: linear-gradient(145deg, #ffffff, #f8f9fa);
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5);
              display: none;
              z-index: 999998;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              border: 1px solid rgba(255,255,255,0.2);
              backdrop-filter: blur(20px);
              animation: slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              overflow: hidden;
            ">
              <!-- Header -->
              <div style="
                padding: 20px 20px 15px 20px;
                background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #A0522D);
                color: white;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
              ">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="
                    width: 40px; 
                    height: 40px; 
                    background: rgba(255,255,255,0.2); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 18px;
                    backdrop-filter: blur(10px);
                  ">🎨</div>
                  <div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">${config.companyName || 'HC Manos de un Artista'}</div>
                    <div style="font-size: 11px; opacity: 0.9;">Asistente de Carpintería</div>
                  </div>
                </div>
                <div id="chat-close" style="
                  cursor: pointer;
                  font-size: 20px;
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.2s ease;
                  background: rgba(255,255,255,0.1);
                ">✕</div>
              </div>
              
              <!-- Mensajes -->
              <div id="chat-messages" style="
                height: 340px;
                overflow-y: auto;
                padding: 20px;
                background: linear-gradient(to bottom, #fafbfc, #f8f9fa);
                position: relative;
              ">
                <!-- Mensaje de bienvenida -->
                <div style="
                  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                  padding: 18px;
                  border-radius: 16px;
                  margin-bottom: 15px;
                  border: 1px solid rgba(0,0,0,0.05);
                  font-size: 14px;
                  line-height: 1.5;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                  position: relative;
                  overflow: hidden;
                  animation: messageSlideIn 0.6s ease-out;
                ">
                  <div style="
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(to bottom, ${config.primaryColor || '#8B4513'}, #CD853F);
                    border-radius: 0 2px 2px 0;
                  "></div>
                  
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="
                      width: 32px;
                      height: 32px;
                      background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 16px;
                      flex-shrink: 0;
                      box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
                    ">🎨</div>
                    
                    <div style="flex: 1; color: #2c3e50;">
                      ¡Hola! Soy el asistente de HC Manos de un Artista 🎨<br><br>Puedo ayudarte con información sobre:<br>• Nuestros servicios de carpintería<br>• Presupuestos y cotizaciones<br>• Tiempos de entrega<br>• Proyectos personalizados<br><br>¿En qué puedo ayudarte hoy?
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Input area -->
              <div style="
                padding: 20px;
                background: linear-gradient(135deg, #ffffff, #f8f9fa);
                border-radius: 0 0 20px 20px;
                border-top: 1px solid rgba(0,0,0,0.05);
                display: flex;
                gap: 12px;
                align-items: center;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
              ">
                <div style="
                  flex: 1;
                  position: relative;
                  background: white;
                  border-radius: 25px;
                  border: 2px solid #f1f3f4;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                ">
                  <input type="text" id="chat-input" placeholder="Escribe tu consulta aquí..." style="
                    width: 100%;
                    padding: 14px 20px;
                    border: none;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: transparent;
                    color: #2c3e50;
                    box-sizing: border-box;
                  ">
                </div>
                
                <button id="chat-send" style="
                  width: 50px;
                  height: 50px;
                  background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F);
                  color: white;
                  border: none;
                  border-radius: 50%;
                  cursor: pointer;
                  font-size: 18px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
                  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  flex-shrink: 0;
                ">
                  <span style="transform: rotate(-10deg);">📤</span>
                </button>
              </div>
            </div>
          `;
          
          // Agregar al body
          if (document.body) {
            document.body.appendChild(chatContainer);
          } else {
            console.error('Document body not ready');
            return;
          }

          // Esperar a que se rendericen los elementos
          setTimeout(function() {
            const button = document.getElementById('ai-chatbot-button');
            const window = document.getElementById('ai-chatbot-window');
            const closeBtn = document.getElementById('chat-close');
            const sendBtn = document.getElementById('chat-send');
            const input = document.getElementById('chat-input');
            const messages = document.getElementById('chat-messages');
            
            if (!button || !window || !closeBtn || !sendBtn || !input || !messages) {
              console.error('Chatbot elements not found');
              return;
            }

            // Eventos del botón
            button.onclick = function() {
              const isHidden = window.style.display === 'none' || window.style.display === '';
              window.style.display = isHidden ? 'block' : 'none';
            };
            
            closeBtn.onclick = function() {
              window.style.display = 'none';
            };
            
            // Función para enviar mensaje
            async function sendMessage() {
              if (!input || !messages) return;

              const message = input.value.trim();
              if (message) {
                // Mostrar mensaje del usuario
                messages.innerHTML += `
                  <div style="text-align: right; margin-bottom: 16px; animation: messageSlideIn 0.3s ease-out;">
                    <div style="
                      background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F); 
                      color: white; 
                      padding: 12px 18px; 
                      border-radius: 20px 20px 5px 20px; 
                      display: inline-block; 
                      max-width: 75%; 
                      font-size: 14px; 
                      line-height: 1.4;
                      box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
                      position: relative;
                      word-wrap: break-word;
                    ">
                      ${message}
                    </div>
                  </div>
                `;
                
                input.value = '';
                messages.scrollTop = messages.scrollHeight;
                
                // Mostrar indicador de escritura
                const typingId = 'typing-' + Date.now();
                messages.innerHTML += `
                  <div id="${typingId}" style="margin-bottom: 16px; animation: messageSlideIn 0.3s ease-out;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                      <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        flex-shrink: 0;
                        box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
                      ">🎨</div>
                      
                      <div style="
                        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                        padding: 12px 18px;
                        border-radius: 20px 20px 20px 5px;
                        display: inline-block;
                        font-size: 14px;
                        color: #6c757d;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                        border: 1px solid rgba(0,0,0,0.05);
                      ">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div style="display: flex; gap: 4px;">
                            <div style="width: 8px; height: 8px; background: ${config.primaryColor || '#8B4513'}; border-radius: 50%; animation: typing-dots 1.4s infinite ease-in-out;"></div>
                            <div style="width: 8px; height: 8px; background: ${config.primaryColor || '#8B4513'}; border-radius: 50%; animation: typing-dots 1.4s infinite ease-in-out 0.2s;"></div>
                            <div style="width: 8px; height: 8px; background: ${config.primaryColor || '#8B4513'}; border-radius: 50%; animation: typing-dots 1.4s infinite ease-in-out 0.4s;"></div>
                          </div>
                          <span>Escribiendo...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                messages.scrollTop = messages.scrollHeight;
                
                try {
                  const response = await fetch(`${config.apiUrl}/api/chat/public`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: message,
                      conversation_id: conversationId,
                      use_rag: true,
                      max_documents: 5
                    })
                  });
                  
                  const typingElement = document.getElementById(typingId);
                  if (typingElement) typingElement.remove();
                  
                  if (response.ok) {
                    const data = await response.json();
                    
                    const formattedResponse = data.response
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: ${config.primaryColor || '#8B4513'};">$1</strong>')
                      .replace(/• /g, '&nbsp;&nbsp;• ');
                    
                    messages.innerHTML += `
                      <div style="margin-bottom: 16px; animation: messageSlideIn 0.4s ease-out;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                          <div style="
                            width: 32px;
                            height: 32px;
                            background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 16px;
                            flex-shrink: 0;
                            box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
                          ">🎨</div>
                          
                          <div style="
                            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                            padding: 16px 20px;
                            border-radius: 20px 20px 20px 5px;
                            max-width: 85%;
                            font-size: 14px;
                            color: #2c3e50;
                            line-height: 1.5;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                            border: 1px solid rgba(0,0,0,0.05);
                            position: relative;
                            word-wrap: break-word;
                          ">
                            ${formattedResponse}
                          </div>
                        </div>
                      </div>
                    `;
                  } else {
                    messages.innerHTML += `
                      <div style="margin-bottom: 8px;">
                        <span style="background: #ffe6e6; padding: 6px 10px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 13px; color: #cc0000;">
                          ❌ Error: No se pudo procesar tu mensaje
                        </span>
                      </div>
                    `;
                  }
                } catch (error) {
                  const typingElement = document.getElementById(typingId);
                  if (typingElement) typingElement.remove();
                  
                  messages.innerHTML += `
                    <div style="margin-bottom: 8px;">
                      <span style="background: #ffe6e6; padding: 6px 10px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 13px; color: #cc0000;">
                        ❌ Error de conexión. Verifica que el backend esté ejecutándose en ${config.apiUrl}
                      </span>
                    </div>
                  `;
                }
                
                messages.scrollTop = messages.scrollHeight;
              }
            }
            
            // Eventos
            sendBtn.onclick = sendMessage;
            input.onkeypress = function(e) {
              if (e.key === 'Enter') {
                sendMessage();
              }
            };

            console.log('✅ Chatbot moderno inicializado correctamente');

          }, 500);

        } catch (error) {
          console.error('Error creating chatbot:', error);
        }
      }

      // Inicializar
      waitForDOM(function() {
        setTimeout(createChatbot, 1000);
      });

      // Backup
      setTimeout(function() {
        if (!document.getElementById('ai-chatbot-button')) {
          console.log('Retrying chatbot creation...');
          createChatbot();
        }
      }, 5000);
    }
  };
})();