# 🚀 Deployment Strategy - Enterprise AI Brain

## 📊 **Comparación de Opciones**

### **Opción 1: Servicio Separado en Railway (RECOMENDADO)**

```
Railway Dashboard:
├── ai-chatbot (actual)           # Para chatbots de marketing
│   ├── Variables: OPENAI_API_KEY, DATABASE_URL_1
│   ├── Dominio: chatbot.railway.app
│   └── Base de datos: PostgreSQL + ChromaDB
│
└── enterprise-ai-brain (nuevo)   # Para inteligencia empresarial  
    ├── Variables: OPENAI_API_KEY, DATABASE_URL_2 (nueva)
    ├── Dominio: enterprise.railway.app
    └── Base de datos: PostgreSQL + ChromaDB (separada)
```

**✅ Ventajas:**
- Aislamiento completo de datos
- Escalabilidad independiente
- Cero riesgo al sistema actual
- Diferentes configuraciones por uso
- Billing separado por cliente

**❌ Desventajas:**  
- Costo adicional (~$20/mes más)
- Gestión de 2 servicios

---

### **Opción 2: Mismo Servicio, Endpoints Separados**

```
ai-chatbot-expandido.railway.app:
├── /api/chat/           # Endpoints actuales (sin tocar)
├── /api/enterprise/     # Nuevos endpoints empresariales
├── /dashboard/          # Dashboard ejecutivo
└── Variables: Compartidas + nuevas específicas
```

**✅ Ventajas:**
- Un solo servicio que mantener
- Costo único
- Compartir algunas configuraciones

**❌ Desventajas:**
- Riesgo de afectar sistema actual
- Base de datos compartida (menos seguro)
- Difícil escalar independientemente

---

## 🎯 **RECOMENDACIÓN: Opción 1 (Servicio Separado)**

### **¿Por qué?**

1. **🛡️ Seguridad:** Tu chatbot actual sigue funcionando sin riesgo
2. **🏢 Aislamiento:** Datos empresariales completamente separados
3. **📈 Escalabilidad:** Cada sistema puede crecer independientemente  
4. **💼 Comercial:** Puedes vender como productos diferentes

---

## ⚙️ **Variables de Entorno**

### **Compartidas (las mismas):**
```env
# LLM
OPENAI_API_KEY=sk-...                    # Misma key, diferentes cuotas
LANGCHAIN_API_KEY=...                    
LANGCHAIN_PROJECT=enterprise-ai-brain    # Diferente proyecto

# Auth
JWT_SECRET_KEY=...                       # Puede ser la misma
JWT_ALGORITHM=HS256

# General
ENVIRONMENT=production
DEBUG=false
```

### **Específicas del Enterprise AI:**
```env
# Database (NUEVA)
DATABASE_URL=postgresql://user:pass@railway.app:5432/enterprise_db
REDIS_URL=redis://enterprise-redis.railway.app:6379

# Vector Store (NUEVO)
VECTOR_STORE_PATH=./enterprise_chroma_db
ENTERPRISE_MAX_DOCUMENTS=10000           # 100x más que chatbot

# File Processing (MEJORADO)
MAX_FILE_SIZE=104857600                  # 100MB vs 10MB
SUPPORTED_FORMATS=pdf,docx,xlsx,csv,txt,json

# Analytics (NUEVO)
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_FINANCIAL_PARSING=true
ENABLE_TABLE_EXTRACTION=true

# External Connectors (NUEVO)
GOOGLE_DRIVE_CLIENT_ID=...
GOOGLE_DRIVE_CLIENT_SECRET=...
DROPBOX_APP_KEY=...
SALESFORCE_CLIENT_ID=...

# Reporting (NUEVO)
ENABLE_AUTO_REPORTS=true
REPORT_SCHEDULE_CRON=0 9 * * 1           # Lunes 9 AM
```

---

## 🗄️ **Estructura de Base de Datos**

### **ai-chatbot (actual):** Sigue igual
```sql
tenants (rize-cleaning, floors-installer, etc.)
users (admins de cada chatbot)
documents (marketing, ventas)
conversations (chats web)
```

### **enterprise-ai-brain (nuevo):** Nueva estructura
```sql
enterprises (coca-cola, microsoft, startup-x)
users (empleados, ejecutivos)
documents (balances, contratos, reportes)
queries (consultas empresariales)
reports (reportes automáticos)
analytics_cache (resultados pre-calculados)
```

---

## 💰 **Costos Estimados**

### **Railway:**
```
Servicio 1 (ai-chatbot):        $20/mes  # Actual
Servicio 2 (enterprise-ai):     $25/mes  # Nuevo (más recursos)
Total:                          $45/mes
```

### **APIs:**
```
OpenAI (ambos servicios):       $50-150/mes  # Mismo pool
ChromaDB hosting:               $0 (incluido)
PostgreSQL:                     $0 (incluido en Railway)
```

**Total estimado: $95-195/mes** para ambos sistemas completos

---

## 🚀 **Plan de Deployment**

### **Fase 1: Setup Básico (1 día)**
1. Crear nuevo servicio en Railway
2. Clonar estructura desde ai-chatbot
3. Configurar variables de entorno
4. Deploy inicial

### **Fase 2: Extensiones (2-3 días)**  
1. Agregar parsers de documentos avanzados
2. Implementar búsqueda estructurada
3. Crear endpoints empresariales
4. Testing básico

### **Fase 3: Dashboard (2 días)**
1. Frontend ejecutivo
2. Reportes automáticos
3. Visualizaciones de datos
4. Testing completo

### **Fase 4: Conectores (1-2 días)**
1. Google Drive connector
2. APIs empresariales
3. Automatización de ingesta
4. Go live!

**Total: 6-8 días** para sistema completo

---

## 🎯 **¿Procedo con la Implementación?**

Si dices que sí, empiezo creando:
1. Estructura del backend extendido
2. Configuraciones de Railway
3. Scripts de deployment
4. Documentación técnica completa

**¿Cuál opción prefieres: Servicio separado o endpoints en el mismo servicio?**