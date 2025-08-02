(function() {
  console.log('🧪 Widget test iniciado');
  
  // Test super simple para verificar que Wix puede cargar el script
  window.AIChatbot = {
    init: function(config) {
      console.log('✅ Widget test init llamado', config);
      
      // Crear botón de prueba muy simple
      const testButton = document.createElement('div');
      testButton.innerHTML = '🎨 TEST';
      testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: red;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        z-index: 999999;
        font-family: Arial;
      `;
      
      testButton.onclick = function() {
        alert('✅ Widget funcionando! Backend: ' + config.apiUrl);
      };
      
      // Esperar DOM
      if (document.body) {
        document.body.appendChild(testButton);
        console.log('✅ Botón test agregado');
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(testButton);
          console.log('✅ Botón test agregado (DOM ready)');
        });
      }
    }
  };
  
  console.log('✅ Widget test cargado completamente');
})();