# 🚀 Enterprise AI Brain - Guía de Configuración Paso a Paso

## 📋 Paso 1: Crear Repositorio en GitHub

1. **Ve a GitHub.com** y crea un nuevo repositorio:
   - Nombre: `enterprise-ai-brain`
   - Descripción: `🧠 Enterprise AI Brain - Sistema de inteligencia empresarial avanzado`
   - Público o Privado (tu elección)
   - **NO** inicializar con README (ya tenemos uno)

2. **Conectar y subir el código**:
   ```bash
   cd "C:\Users\px\Desktop\enterprise-ai-brain"
   git remote add origin https://github.com/TU_USUARIO/enterprise-ai-brain.git
   git push -u origin master
   ```

## 🚂 Paso 2: Desplegar en Railway

### 2.1 Crear Nuevo Servicio en Railway

1. **Ve a Railway.app** y logueate
2. **Crear New Project** → **Deploy from GitHub repo**
3. **Seleccionar** tu repositorio `enterprise-ai-brain`
4. Railway detectará automáticamente el `railway.toml`

### 2.2 Configurar Base de Datos PostgreSQL

1. **En tu proyecto Railway**, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. **Copiar la DATABASE_URL** generada (algo como `postgresql://postgres:xxx@xxxx.railway.app:5432/railway`)

### 2.3 Configurar Variables de Entorno

En **Settings** → **Variables**, agregar:

#### ✅ Variables Requeridas (IMPORTANTES):
```bash
DATABASE_URL=postgresql://postgres:xxx@xxxx.railway.app:5432/railway
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
JWT_SECRET_KEY=tu-jwt-secret-key-super-seguro-aqui
SECRET_KEY=otra-clave-secreta-para-encriptacion
```

#### ⚙️ Variables Opcionales (ya tienen defaults):
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
LLM_MODEL=gpt-4
EMBEDDING_MODEL=text-embedding-ada-002
ENTERPRISE_MAX_DOCUMENTS=10000
MAX_FILE_SIZE=104857600
```

#### 🔗 Variables para Conectores (opcionales):
```bash
GOOGLE_DRIVE_CLIENT_ID=tu-google-client-id
GOOGLE_DRIVE_CLIENT_SECRET=tu-google-client-secret
LANGCHAIN_API_KEY=tu-langchain-api-key
```

### 2.4 Verificar Despliegue

1. **Railway automáticamente** deployará cuando detecte el push
2. **Verificar logs** en Railway dashboard
3. **Probar endpoint de salud**: `https://tu-app.railway.app/health`

## 🧪 Paso 3: Probar el Sistema

### 3.1 Endpoints Principales

1. **Health Check**: `GET /health`
2. **API Info**: `GET /`
3. **Documentación**: `GET /docs` (solo en desarrollo)

### 3.2 Crear Usuario Enterprise

```bash
POST /api/auth/register
{
  "email": "admin@tuempresa.com",
  "password": "password123",
  "name": "Admin User",
  "enterprise_id": 1
}
```

### 3.3 Login y Obtener Token

```bash
POST /api/auth/login
{
  "email": "admin@tuempresa.com",
  "password": "password123"
}
```

### 3.4 Primera Consulta Enterprise

```bash
POST /api/enterprise/query
Authorization: Bearer tu-jwt-token
{
  "query": "¿Cuáles son las métricas financieras principales de nuestra empresa?"
}
```

## 📊 Paso 4: Configurar Dashboard (Opcional)

El sistema incluye endpoints de analytics:
- `/api/analytics/dashboard` - Dashboard ejecutivo
- `/api/analytics/queries/trends` - Tendencias de consultas
- `/api/analytics/users/engagement` - Engagement de usuarios

## 🔧 Paso 5: Configuración Avanzada (Opcional)

### Base de Datos Separada
Si quieres una base de datos completamente separada del ai-chatbot:
1. Crear nueva base PostgreSQL en Railway
2. Usar esa DATABASE_URL en las variables de entorno

### Conectores de Datos
Para Google Drive, Salesforce, etc.:
1. Configurar OAuth credentials
2. Agregar las variables de entorno correspondientes
3. Usar endpoints `/api/connectors/`

## 🚨 Troubleshooting

### Error: "Database connection failed"
- Verificar que DATABASE_URL esté correcta
- Asegurar que PostgreSQL esté corriendo

### Error: "OpenAI API key invalid"
- Verificar OPENAI_API_KEY
- Asegurar que tenga créditos disponibles

### Error: "Module not found"
- Verificar que requirements.txt esté correcto
- Railway debería instalar automáticamente

## 📈 Diferencias vs AI-Chatbot

| Característica | AI-Chatbot | Enterprise AI Brain |
|----------------|------------|-------------------|
| **Base de datos** | Compartida | Separada (recomendado) |
| **Usuarios** | Visitantes web | Empleados autentificados |
| **Documentos** | 100 max, 10MB | 10,000 max, 100MB |
| **Consultas** | Simples | Complejas (análisis financiero) |
| **Analytics** | Básico | Dashboard ejecutivo |
| **Conectores** | Ninguno | Google Drive, CRM, APIs |

## ✅ Checklist de Verificación

- [ ] Repositorio creado y código subido
- [ ] Servicio Railway creado y deployado
- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno configuradas
- [ ] Health check responde correctamente
- [ ] Usuario admin creado
- [ ] Primera consulta enterprise funciona
- [ ] Analytics dashboard accesible

## 🎯 URLs Importantes

- **Repositorio**: https://github.com/TU_USUARIO/enterprise-ai-brain
- **Railway App**: https://tu-app.railway.app
- **Health Check**: https://tu-app.railway.app/health
- **API Docs**: https://tu-app.railway.app/docs (solo desarrollo)

## 💡 Próximos Pasos

1. **Subir documentos reales** de tu empresa
2. **Probar consultas complejas** como "balance general 2023"
3. **Configurar conectores** a Google Drive o CRM
4. **Crear dashboard frontend** (React/Vue) si necesitas UI
5. **Configurar alertas** y monitoreo

---

¿Tienes algún error o necesitas ayuda con algún paso específico?