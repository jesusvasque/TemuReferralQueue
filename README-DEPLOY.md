# Temu Referidos Colombia - Guía de Despliegue

## Arquitectura de Despliegue

- **Frontend**: InfinityFree (hosting estático)
- **Backend**: Render (API + WebSockets)
- **Base de datos**: PostgreSQL en Render

## 🚀 Pasos de Despliegue

### 1. Configurar Backend en Render

1. **Crear cuenta en Render.com**
2. **Crear servicio PostgreSQL**:
   - Ve a Dashboard > New > PostgreSQL
   - Configura la base de datos
   - Guarda la `DATABASE_URL` que te proporcionen

3. **Crear Web Service para Backend**:
   - Ve a Dashboard > New > Web Service
   - Conecta tu repositorio de GitHub
   - Configuración:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Root Directory**: `.` (raíz del proyecto)

4. **Variables de entorno en Render**:
   ```
   NODE_ENV=production
   DATABASE_URL=[tu-database-url-de-render]
   PORT=8000
   FRONTEND_URLS=https://tu-sitio.infinityfreeapp.com
   ```

5. **Aplicar esquema de base de datos**:
   - Después del primer deploy, ve a Shell en tu servicio
   - Ejecuta: `npm run db:push`

### 2. Configurar Frontend en InfinityFree

1. **Construir el frontend**:
   ```bash
   # Usar la configuración de Vite para InfinityFree
   npx vite build --config vite.config.infinityfree.ts
   ```

2. **Configurar variables de entorno**:
   - Crea archivo `.env.production` en la carpeta `client/`:
   ```
   VITE_API_URL=https://tu-backend.onrender.com
   VITE_WS_URL=wss://tu-backend.onrender.com/ws
   VITE_API_HOST=tu-backend.onrender.com
   ```

3. **Subir archivos a InfinityFree**:
   - Sube todo el contenido de `dist-frontend/` a `htdocs/` en InfinityFree
   - Asegúrate de que `index.html` esté en la raíz de `htdocs/`

### 3. Scripts de Construcción

**Para Backend (Render)**:
```bash
# Usar package.render.json
cp package.render.json package.json
npm install
npm run build
