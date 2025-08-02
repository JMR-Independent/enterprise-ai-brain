(function() {
  window.AIChatbot = {
    init: function(config) {
      // Función mejorada para esperar DOM
      function waitForDOM(callback) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', callback);
        } else {
          // Si el DOM ya está listo, esperar un poco más
          setTimeout(callback, 1000);
        }
      }

      // Función para crear el chatbot de forma segura
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
          chatContainer.innerHTML = `
            <!-- Botón del chatbot mejorado -->
            <div id="ai-chatbot-button" style="
              position: fixed !important;
              bottom: 25px !important;
              right: 25px !important;
              width: 70px !important;
              height: 70px !important;
              background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #A0522D, #CD853F) !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-size: 28px !important;
              cursor: pointer !important;
              box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4), 0 4px 10px rgba(0,0,0,0.1) !important;
              z-index: 999999 !important;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
              border: 3px solid rgba(255,255,255,0.2) !important;
              backdrop-filter: blur(10px) !important;
              animation: pulse-glow 3s infinite ease-in-out !important;
            " onmouseover="this.style.transform='scale(1.1) rotate(5deg)'; this.style.boxShadow='0 12px 35px rgba(139, 69, 19, 0.6), 0 6px 15px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='scale(1) rotate(0deg)'; this.style.boxShadow='0 8px 25px rgba(139, 69, 19, 0.4), 0 4px 10px rgba(0,0,0,0.1)';">
              <div style="display: flex; align-items: center; justify-content: center; animation: bounce-icon 2s infinite;">
                🎨
              </div>
            </div>
            
            <style>
              @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4), 0 4px 10px rgba(0,0,0,0.1), 0 0 0 0 rgba(139, 69, 19, 0.4) !important; }
                50% { box-shadow: 0 8px 25px rgba(139, 69, 19, 0.6), 0 4px 10px rgba(0,0,0,0.1), 0 0 0 10px rgba(139, 69, 19, 0.1) !important; }
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
              
              /* Scroll bar personalizado */
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
            </style>
            
            <!-- Ventana del chat moderna -->
            <div id="ai-chatbot-window" style="
              position: fixed !important;
              bottom: 110px !important;
              right: 25px !important;
              width: 380px !important;
              height: 500px !important;
              background: linear-gradient(145deg, #ffffff, #f8f9fa) !important;
              border-radius: 20px !important;
              box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) !important;
              display: none !important;
              z-index: 999998 !important;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
              border: 1px solid rgba(255,255,255,0.2) !important;
              backdrop-filter: blur(20px) !important;
              animation: slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
              overflow: hidden !important;
            ">
              <!-- Header moderno -->
              <div style="
                padding: 20px 20px 15px 20px !important;
                background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #A0522D) !important;
                color: white !important;
                border-radius: 20px 20px 0 0 !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                position: relative !important;
                overflow: hidden !important;
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
                  cursor: pointer !important;
                  font-size: 20px !important;
                  width: 30px !important;
                  height: 30px !important;
                  border-radius: 50% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  transition: all 0.2s ease !important;
                  background: rgba(255,255,255,0.1) !important;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='scale(1)';">✕</div>
                
                <!-- Efecto de fondo -->
                <div style="
                  position: absolute;
                  top: -50%;
                  right: -50%;
                  width: 100%;
                  height: 100%;
                  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                  pointer-events: none;
                "></div>
              </div>
              
              <!-- Área de mensajes moderna -->
              <div id="chat-messages" style="
                height: 340px !important;
                overflow-y: auto !important;
                padding: 20px !important;
                background: linear-gradient(to bottom, #fafbfc, #f8f9fa) !important;
                position: relative !important;
              ">
                <!-- Mensaje de bienvenida mejorado -->
                <div style="
                  background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
                  padding: 18px !important;
                  border-radius: 16px !important;
                  margin-bottom: 15px !important;
                  border: 1px solid rgba(0,0,0,0.05) !important;
                  font-size: 14px !important;
                  line-height: 1.5 !important;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
                  position: relative !important;
                  overflow: hidden !important;
                  animation: messageSlideIn 0.6s ease-out !important;
                ">
                  <!-- Indicador de bot -->
                  <div style="
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(to bottom, ${config.primaryColor || '#8B4513'}, #CD853F);
                    border-radius: 0 2px 2px 0;
                  "></div>
                  
                  <!-- Avatar del bot -->
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
                      ${config.welcomeMessage || '¡Hola! Soy el asistente de HC Manos de un Artista 🎨<br><br>Puedo ayudarte con información sobre:<br>• Nuestros servicios de carpintería<br>• Presupuestos y cotizaciones<br>• Tiempos de entrega<br>• Proyectos personalizados<br><br>¿En qué puedo ayudarte hoy?'}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Área de input moderna -->
              <div style="
                padding: 20px !important;
                background: linear-gradient(135deg, #ffffff, #f8f9fa) !important;
                border-radius: 0 0 20px 20px !important;
                border-top: 1px solid rgba(0,0,0,0.05) !important;
                display: flex !important;
                gap: 12px !important;
                align-items: center !important;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important;
              ">
                <!-- Input mejorado -->
                <div style="
                  flex: 1;
                  position: relative;
                  background: white;
                  border-radius: 25px;
                  border: 2px solid #f1f3f4;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                " onfocus="this.style.borderColor='${config.primaryColor || '#8B4513'}'; this.style.boxShadow='0 4px 12px rgba(139, 69, 19, 0.15)';" onblur="this.style.borderColor='#f1f3f4'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';">
                  <input type="text" id="chat-input" placeholder="Escribe tu consulta aquí..." style="
                    width: 100% !important;
                    padding: 14px 20px !important;
                    border: none !important;
                    border-radius: 25px !important;
                    outline: none !important;
                    font-size: 14px !important;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                    background: transparent !important;
                    color: #2c3e50 !important;
                    box-sizing: border-box !important;
                  " onfocus="this.parentElement.style.borderColor='${config.primaryColor || '#8B4513'}'; this.parentElement.style.boxShadow='0 4px 12px rgba(139, 69, 19, 0.15)';" onblur="this.parentElement.style.borderColor='#f1f3f4'; this.parentElement.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';">
                </div>
                
                <!-- Botón de envío mejorado -->
                <button id="chat-send" style="
                  width: 50px !important;
                  height: 50px !important;
                  background: linear-gradient(135deg, ${config.primaryColor || '#8B4513'}, #CD853F) !important;
                  color: white !important;
                  border: none !important;
                  border-radius: 50% !important;
                  cursor: pointer !important;
                  font-size: 18px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3) !important;
                  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                  flex-shrink: 0 !important;
                " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 16px rgba(139, 69, 19, 0.4)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(139, 69, 19, 0.3)';">
                  <span style="transform: rotate(-10deg);">📤</span>
                </button>
              </div>
            </div>
          `;
          
          // Agregar al body de forma segura
          if (document.body) {
            document.body.appendChild(chatContainer);
          } else {
            console.error('Document body not ready');
            return;
          }

          // Esperar un poco más para que los elementos se rendericen
          setTimeout(function() {
            // Variables - CON VERIFICACIÓN NULL
            const button = document.getElementById('ai-chatbot-button');
            const window = document.getElementById('ai-chatbot-window');
            const closeBtn = document.getElementById('chat-close');
            const sendBtn = document.getElementById('chat-send');
            const input = document.getElementById('chat-input');
            const messages = document.getElementById('chat-messages');
            
            // Verificar que todos los elementos existan
            if (!button || !window || !closeBtn || !sendBtn || !input || !messages) {
              console.error('Chatbot elements not found:', {
                button: !!button,
                window: !!window,
                closeBtn: !!closeBtn,
                sendBtn: !!sendBtn,
                input: !!input,
                messages: !!messages
              });
              return;
            }

            // Abrir/cerrar chat - CON VERIFICACIÓN
            if (button && window) {
              button.onclick = function() {
                const isHidden = window.style.display === 'none' || window.style.display === '';
                window.style.display = isHidden ? 'block' : 'none';
              };
            }
            
            // Cerrar chat - CON VERIFICACIÓN
            if (closeBtn && window) {
              closeBtn.onclick = function() {
                window.style.display = 'none';
              };
            }
            
            // Función para enviar mensaje - TU CÓDIGO ACTUALIZADO
            async function sendMessage() {
              if (!input || !messages) {
                console.error('Input or messages element not found');
                return;
              }

              const message = input.value.trim();
              if (message) {
                // Mostrar mensaje del usuario con estilo moderno
                messages.innerHTML += `
                  <div style="
                    text-align: right; 
                    margin-bottom: 16px; 
                    animation: messageSlideIn 0.3s ease-out;
                  ">
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
                      <!-- Indicador de envío -->
                      <div style="
                        position: absolute;
                        bottom: -8px;
                        right: 8px;
                        width: 0;
                        height: 0;
                        border-left: 8px solid transparent;
                        border-right: 8px solid transparent;
                        border-top: 8px solid #CD853F;
                      "></div>
                    </div>
                  </div>
                `;
                
                input.value = '';
                messages.scrollTop = messages.scrollHeight;
                
                // Mostrar indicador de "escribiendo..." moderno
                const typingId = 'typing-' + Date.now();
                messages.innerHTML += `
                  <div id="${typingId}" style="
                    margin-bottom: 16px; 
                    animation: messageSlideIn 0.3s ease-out;
                  ">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                      <!-- Avatar del bot -->
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
                      
                      <!-- Indicador de escritura animado -->
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
                            <div style="
                              width: 8px; 
                              height: 8px; 
                              background: ${config.primaryColor || '#8B4513'}; 
                              border-radius: 50%; 
                              animation: typing-dots 1.4s infinite ease-in-out;
                            "></div>
                            <div style="
                              width: 8px; 
                              height: 8px; 
                              background: ${config.primaryColor || '#8B4513'}; 
                              border-radius: 50%; 
                              animation: typing-dots 1.4s infinite ease-in-out 0.2s;
                            "></div>
                            <div style="
                              width: 8px; 
                              height: 8px; 
                              background: ${config.primaryColor || '#8B4513'}; 
                              border-radius: 50%; 
                              animation: typing-dots 1.4s infinite ease-in-out 0.4s;
                            "></div>
                          </div>
                          <span>Escribiendo...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                messages.scrollTop = messages.scrollHeight;
                
                try {
                  // USAR ENDPOINT PÚBLICO - CAMBIADO AQUÍ
                  const response = await fetch(`${config.apiUrl}/api/chat/public`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      message: message,
                      conversation_id: conversationId,
                      use_rag: true,
                      max_documents: 5
                    })
                  });
                  
                  // Remover indicador de "escribiendo..."
                  const typingElement = document.getElementById(typingId);
                  if (typingElement) {
                    typingElement.remove();
                  }
                  
                  if (response.ok) {
                    const data = await response.json();
                    
                    // Mostrar respuesta del AI con diseño moderno
                    const formattedResponse = data.response
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: ${config.primaryColor || '#8B4513'};">$1</strong>')
                      .replace(/• /g, '&nbsp;&nbsp;• ');
                    
                    messages.innerHTML += `
                      <div style="
                        margin-bottom: 16px; 
                        animation: messageSlideIn 0.4s ease-out;
                      ">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                          <!-- Avatar del bot -->
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
                          
                          <!-- Mensaje del bot -->
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
                            
                            <!-- Indicador de respuesta automática -->
                            <div style="
                              position: absolute;
                              bottom: -8px;
                              left: 8px;
                              width: 0;
                              height: 0;
                              border-left: 8px solid transparent;
                              border-right: 8px solid transparent;
                              border-top: 8px solid #e9ecef;
                            "></div>
                          </div>
                        </div>
                      </div>
                    `;
                    
                    // Si usó RAG, mostrar indicador
                    if (data.rag_used) {
                      console.log('✅ RAG was used for this response');
                    }
                    
                  } else {
                    // Error del servidor
                    const errorData = await response.json().catch(() => ({}));
                    messages.innerHTML += `
                      <div style="margin-bottom: 8px;">
                        <span style="background: #ffe6e6; padding: 6px 10px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 13px; color: #cc0000;">
                          ❌ Error: ${errorData.detail || 'No se pudo procesar tu mensaje'}
                        </span>
                      </div>
                    `;
                  }
                  
                } catch (error) {
                  // Error de conexión
                  console.error('Error connecting to backend:', error);
                  
                  // Remover indicador de "escribiendo..." si aún existe
                  const typingElement = document.getElementById(typingId);
                  if (typingElement) {
                    typingElement.remove();
                  }
                  
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
            
            // Eventos - CON VERIFICACIÓN
            if (sendBtn) {
              sendBtn.onclick = sendMessage;
            }
            
            if (input) {
              input.onkeypress = function(e) {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              };
            }

            // Función para efecto de escritura
            function typeWriter(element, text, speed = 30) {
              let i = 0;
              element.innerHTML = '';
              
              function type() {
                if (i < text.length) {
                  if (text.charAt(i) === '<') {
                    // Si encontramos una etiqueta HTML, la añadimos completa
                    let tagEnd = text.indexOf('>', i);
                    if (tagEnd !== -1) {
                      element.innerHTML += text.substring(i, tagEnd + 1);
                      i = tagEnd + 1;
                    } else {
                      element.innerHTML += text.charAt(i);
                      i++;
                    }
                  } else {
                    element.innerHTML += text.charAt(i);
                    i++;
                  }
                  setTimeout(type, speed);
                  messages.scrollTop = messages.scrollHeight;
                }
              }
              type();
            }

            console.log('✅ Chatbot moderno inicializado con efectos avanzados');

          }, 500); // Esperar 500ms para que se rendericen los elementos

        } catch (error) {
          console.error('Error creating chatbot:', error);
        }
      }

      // Inicializar con múltiples intentos
      waitForDOM(function() {
        setTimeout(createChatbot, 1000);
      });

      // Backup: intentar de nuevo si falla la primera vez
      setTimeout(function() {
        if (!document.getElementById('ai-chatbot-button')) {
          console.log('Retrying chatbot creation...');
          createChatbot();
        }
      }, 5000);
    }
  };
})();