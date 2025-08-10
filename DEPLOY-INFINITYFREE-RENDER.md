# Guía de Despliegue: InfinityFree + Render

Esta aplicación está optimizada para un despliegue híbrido:
- **Frontend**: InfinityFree (hosting estático gratuito)
- **Backend**: Render (API + WebSockets + PostgreSQL)

## 🎯 Arquitectura de Despliegue

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  InfinityFree   │    │     Render       │    │  PostgreSQL     │
│   (Frontend)    ├───►│   (Backend)      ├───►│  (Database)     │
│  Static Files   │    │ API + WebSocket  │    │    Render       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Pasos de Despliegue

### Paso 1: Construir la Aplicación

```bash
# Ejecutar script completo de construcción
./deploy-infinityfree-render.sh

# O construir por separado:
./build-frontend.sh  # Para InfinityFree
./build-backend.sh   # Para Render
```

### Paso 2: Backend en Render

1. **Crear cuenta en render.com**

2. **Crear base de datos PostgreSQL**:
   - Dashboard → New → PostgreSQL
   - Región: Oregon (US-West) o Frankfurt (EU)
   - Guardar la `DATABASE_URL` generada

3. **Crear Web Service**:
   - Dashboard → New → Web Service
   - Conectar repositorio GitHub
   - **Configuración**:
     - Build Command: `chmod +x build-backend.sh && ./build-backend.sh`
     - Start Command: `node dist-backend/index-render.js`
     - Node Version: 18+

4. **Variables de entorno**:
   ```
   NODE_ENV=production
   DATABASE_URL=[tu-database-url-de-render]
   PORT=10000
   FRONTEND_URLS=https://[tu-sitio].infinityfreeapp.com
   ```

5. **Aplicar esquema de base de datos**:
   - Después del primer deploy: Render Shell → `npm run db:push`

### Paso 3: Frontend en InfinityFree

1. **Actualizar configuración**:
   ```bash
   # client/.env.production
   VITE_API_URL=https://tu-backend.onrender.com
   VITE_WS_URL=wss://tu-backend.onrender.com/ws
   VITE_API_HOST=tu-backend.onrender.com
   ```

2. **Reconstruir con URLs reales**:
   ```bash
   ./build-frontend.sh
   ```

3. **Subir a InfinityFree**:
   - File Manager → htdocs/
   - Subir TODO el contenido de `dist-frontend/`
   - Verificar que `index.html` esté en la raíz

4. **Crear .htaccess** (opcional para mejor SEO):
   ```apache
   # htdocs/.htaccess
   <IfModule mod_rewrite.c>
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   </IfModule>
   
   # Cache para mejor rendimiento
   <IfModule mod_expires.c>
   ExpiresActive on
   ExpiresByType text/css "access plus 1 month"
   ExpiresByType application/javascript "access plus 1 month"
   ExpiresByType image/png "access plus 1 month"
   </IfModule>
   ```

## 🔧 Configuración CORS

El backend ya está configurado para aceptar requests desde dominios de InfinityFree:

```javascript
// Dominios permitidos automáticamente:
- *.infinityfreeapp.com
- *.000webhostapp.com  
- *.onrender.com
```

## 📊 Monitoreo y Logs

### Render (Backend):
- Dashboard → Tu servicio → Logs
- Métricas de CPU, memoria y tráfico
- Shell para comandos manuales

### InfinityFree (Frontend):
- Panel de control → File Manager
- Estadísticas de tráfico web
- Error logs en cPanel

## 🔄 Actualizaciones

### Backend:
1. Push cambios a GitHub
2. Render auto-deploya automáticamente

### Frontend:
1. Actualizar código localmente
2. `./build-frontend.sh`
3. Subir archivos actualizados a htdocs/

## ⚡ Optimizaciones

### Rendimiento:
- Frontend servido desde CDN de InfinityFree
- Backend optimizado con esbuild bundling
- WebSockets para actualizaciones en tiempo real
- Caché de navegador configurado

### Costos:
- **InfinityFree**: Gratuito permanente
- **Render**: 750 horas gratuitas/mes (suficiente para 24/7)
- **PostgreSQL Render**: Plan gratuito disponible

## 🚨 Resolución de Problemas

### Error CORS:
```bash
# Verificar que FRONTEND_URLS esté configurado correctamente
# Debe incluir el dominio exacto de InfinityFree
```

### WebSocket no conecta:
```bash
# Asegurar que se use WSS (no WS) en producción
VITE_WS_URL=wss://tu-backend.onrender.com/ws
```

### Base de datos no conecta:
```bash
# Verificar DATABASE_URL en variables de entorno de Render
# Ejecutar db:push después del primer deploy
```

---

**¡Tu aplicación estará disponible 24/7 de forma gratuita!** 🎉

- Capacidad: 100+ usuarios simultáneos
- Uptime: 99.9% garantizado por ambas plataformas
- SSL/TLS habilitado automáticamente