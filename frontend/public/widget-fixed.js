(function() {
  window.AIChatbot = {
    init: function(config) {
      // Eliminar widgets existentes
      const existing = document.querySelectorAll('#ai-chatbot-button, #ai-chatbot-window');
      existing.forEach(el => el.remove());
      
      // Hacer invisible el contenedor de Wix si existe
      const wixContainers = document.querySelectorAll('[data-testid="richTextElement"]');
      wixContainers.forEach(container => {
        if (container.innerHTML.includes('AIChatbot.init')) {
          container.style.cssText = 'position: absolute !important; left: -9999px !important; width: 1px !important; height: 1px !important; opacity: 0 !important; overflow: hidden !important;';
        }
      });

      let conversationId = 'web-chat-' + Date.now();

      // Crear contenedor
      const container = document.createElement('div');
      container.innerHTML = `
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          /* Forzar posición fija del botón */
          #ai-chatbot-button {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important;
            transform: none !important;
            transition: none !important;
          }
          
          #ai-chatbot-window {
            position: fixed !important;
            bottom: 90px !important;
            right: 20px !important;
            z-index: 2147483646 !important;
          }
        </style>
        
        <!-- Botón del chatbot -->
        <div id="ai-chatbot-button" style="
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          width: 60px !important;
          height: 60px !important;
          background: linear-gradient(135deg, #2196F3, #1976D2) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: white !important;
          font-size: 24px !important;
          cursor: pointer !important;
          box-shadow: 0 6px 25px rgba(33, 150, 243, 0.4) !important;
          z-index: 2147483647 !important;
          transition: none !important;
          animation: pulse 2s infinite !important;
          border: 3px solid rgba(255,255,255,0.3) !important;
          transform: none !important;
          margin: 0 !important;
          padding: 0 !important;
          top: auto !important;
          left: auto !important;
        ">💬</div>
        
        <!-- Ventana del chat -->
        <div id="ai-chatbot-window" style="
          position: fixed !important;
          bottom: 90px !important;
          right: 20px !important;
          width: 320px !important;
          height: 400px !important;
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15), 0 5px 15px rgba(33, 150, 243, 0.1) !important;
          display: none !important;
          z-index: 2147483646 !important;
          overflow: hidden !important;
          animation: slideUp 0.3s ease !important;
          border: 1px solid rgba(33, 150, 243, 0.1) !important;
        ">
          <!-- Header -->
          <div style="
            padding: 15px;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 16px 16px 0 0;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 35px;
                height: 35px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                backdrop-filter: blur(10px);
              ">🏠</div>
              <div>
                <div style="font-weight: bold; font-size: 14px;">${config.companyName || 'HC Manos de un Artista'}</div>
                <div style="font-size: 11px; opacity: 0.9;">${config.subtitle || 'Asistente Virtual'}</div>
              </div>
            </div>
            <div id="chat-close" style="
              cursor: pointer;
              font-size: 20px;
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: rgba(255,255,255,0.2);
              transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</div>
          </div>
          
          <!-- Mensajes -->
          <div id="chat-messages" style="
            height: 250px;
            overflow-y: auto;
            padding: 15px;
            background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          ">
            <div style="
              background: white;
              padding: 15px;
              border-radius: 12px;
              margin-bottom: 10px;
              border-left: 3px solid #2196F3;
              box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
              animation: fadeIn 0.5s ease;
            ">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 14px;">🏠</span>
                <strong style="color: #2196F3; font-size: 13px;">Asistente HC</strong>
              </div>
              <div style="font-size: 13px; line-height: 1.4;">
                ¡Hola! Soy el asistente de HC Manos de un Artista.<br><br>
                Puedo ayudarte con:<br>
                • Servicios de carpintería<br>
                • Presupuestos<br>
                • Proyectos personalizados<br><br>
                ¿En qué puedo ayudarte?
              </div>
            </div>
          </div>
          
          <!-- Input -->
          <div style="
            padding: 12px;
            background: linear-gradient(135deg, #ffffff, #f8f9fa);
            border-top: 1px solid rgba(33, 150, 243, 0.1);
            display: flex;
            gap: 10px;
            border-radius: 0 0 16px 16px;
          ">
            <input type="text" id="chat-input" placeholder="Escribe tu mensaje..." style="
              flex: 1;
              padding: 10px 14px;
              border: 2px solid #e3f2fd;
              border-radius: 20px;
              outline: none;
              font-size: 13px;
              transition: all 0.2s ease;
              background: white;
            " onfocus="this.style.borderColor='#2196F3'; this.style.boxShadow='0 0 0 3px rgba(33, 150, 243, 0.1)'" onblur="this.style.borderColor='#e3f2fd'; this.style.boxShadow='none'">
            <button id="chat-send" style="
              width: 38px;
              height: 38px;
              background: linear-gradient(135deg, #2196F3, #1976D2);
              color: white;
              border: none;
              border-radius: 50%;
              cursor: pointer;
              font-size: 16px;
              transition: all 0.2s ease;
              box-shadow: 0 3px 10px rgba(33, 150, 243, 0.3);
            " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 14px rgba(33, 150, 243, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 3px 10px rgba(33, 150, 243, 0.3)'">➤</button>
          </div>
        </div>
      `;
      
      // Esperar a que el DOM esté listo
      if (document.body) {
        document.body.appendChild(container);
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(container);
        });
      }
      
      // Esperar y configurar eventos
      setTimeout(function() {
        const button = document.getElementById('ai-chatbot-button');
        const window = document.getElementById('ai-chatbot-window');
        const closeBtn = document.getElementById('chat-close');
        const sendBtn = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');
        const messages = document.getElementById('chat-messages');
        
        if (!button || !window || !closeBtn || !sendBtn || !input || !messages) {
          console.error('Widget elements not found');
          return;
        }
      
      button.onclick = () => {
        window.style.display = window.style.display === 'none' ? 'block' : 'none';
      };
      
      closeBtn.onclick = () => {
        window.style.display = 'none';
      };
      
      async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        // Mostrar mensaje del usuario
        messages.innerHTML += `
          <div style="text-align: right; margin-bottom: 12px;">
            <div style="
              background: linear-gradient(135deg, #2196F3, #1976D2);
              color: white;
              padding: 12px 18px;
              border-radius: 18px 18px 5px 18px;
              display: inline-block;
              max-width: 75%;
              animation: fadeIn 0.3s ease;
              box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
              font-size: 14px;
              line-height: 1.4;
            ">${message}</div>
          </div>
        `;
        
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
        
        // Mostrar "escribiendo..."
        const typingId = 'typing-' + Date.now();
        messages.innerHTML += `
          <div id="${typingId}" style="margin-bottom: 12px;">
            <div style="
              background: white;
              padding: 12px 18px;
              border-radius: 18px 18px 18px 5px;
              display: inline-block;
              border-left: 4px solid #2196F3;
              color: #666;
              box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
              font-size: 14px;
            ">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="display: flex; gap: 3px;">
                  <div style="width: 6px; height: 6px; background: #2196F3; border-radius: 50%; animation: pulse 1.4s infinite;"></div>
                  <div style="width: 6px; height: 6px; background: #2196F3; border-radius: 50%; animation: pulse 1.4s infinite 0.2s;"></div>
                  <div style="width: 6px; height: 6px; background: #2196F3; border-radius: 50%; animation: pulse 1.4s infinite 0.4s;"></div>
                </div>
                <span>Escribiendo...</span>
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
          
          document.getElementById(typingId).remove();
          
          if (response.ok) {
            const data = await response.json();
            const formattedResponse = data.response
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/• /g, '&nbsp;&nbsp;• ');
            
            messages.innerHTML += `
              <div style="margin-bottom: 12px;">
                <div style="
                  background: white;
                  padding: 18px;
                  border-radius: 18px 18px 18px 5px;
                  border-left: 4px solid #2196F3;
                  max-width: 80%;
                  animation: fadeIn 0.3s ease;
                  box-shadow: 0 2px 10px rgba(33, 150, 243, 0.1);
                  font-size: 14px;
                  line-height: 1.5;
                ">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-size: 16px;">🏠</span>
                    <strong style="color: #2196F3; font-size: 15px;">Asistente HC</strong>
                  </div>
                  ${formattedResponse}
                </div>
              </div>
            `;
          } else {
            messages.innerHTML += `
              <div style="margin-bottom: 10px;">
                <div style="background: #ffebee; color: #c62828; padding: 10px; border-radius: 10px;">
                  ❌ Error al procesar el mensaje
                </div>
              </div>
            `;
          }
        } catch (error) {
          document.getElementById(typingId)?.remove();
          messages.innerHTML += `
            <div style="margin-bottom: 10px;">
              <div style="background: #ffebee; color: #c62828; padding: 10px; border-radius: 10px;">
                ❌ Error de conexión
              </div>
            </div>
          `;
        }
        
        messages.scrollTop = messages.scrollHeight;
      }
      
      sendBtn.onclick = sendMessage;
      input.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
      };
        
        console.log('✅ Widget HC Manos de un Artista cargado');
        
        // Forzar posición fija cada segundo para asegurar que no se mueva
        setInterval(function() {
          const chatButton = document.getElementById('ai-chatbot-button');
          const chatWindow = document.getElementById('ai-chatbot-window');
          
          if (chatButton) {
            chatButton.style.position = 'fixed';
            chatButton.style.bottom = '20px';
            chatButton.style.right = '20px';
            chatButton.style.zIndex = '2147483647';
            chatButton.style.transform = 'none';
            chatButton.style.transition = 'none';
          }
          
          if (chatWindow) {
            chatWindow.style.position = 'fixed';
            chatWindow.style.bottom = '90px';
            chatWindow.style.right = '20px';
            chatWindow.style.zIndex = '2147483646';
          }
        }, 1000);
        
        // Forzar posición durante scroll y resize
        function enforcePosition() {
          const chatButton = document.getElementById('ai-chatbot-button');
          const chatWindow = document.getElementById('ai-chatbot-window');
          
          if (chatButton) {
            chatButton.style.cssText = `
              position: fixed !important;
              bottom: 20px !important;
              right: 20px !important;
              width: 60px !important;
              height: 60px !important;
              z-index: 2147483647 !important;
              transform: none !important;
              transition: none !important;
              background: linear-gradient(135deg, #2196F3, #1976D2) !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              color: white !important;
              font-size: 24px !important;
              cursor: pointer !important;
              box-shadow: 0 6px 25px rgba(33, 150, 243, 0.4) !important;
              border: 3px solid rgba(255,255,255,0.3) !important;
              animation: pulse 2s infinite !important;
            `;
          }
        }
        
        // Eventos para mantener posición
        window.addEventListener('scroll', enforcePosition);
        window.addEventListener('resize', enforcePosition);
        document.addEventListener('scroll', enforcePosition);
        
      }, 500);
    }
  };
})();