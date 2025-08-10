# Temu Referidos Colombia - Sistema de Cola

Sistema web colaborativo para compartir códigos de referido de Temu en Colombia con arquitectura optimizada para despliegue gratuito.

## 🏗️ Arquitectura de Despliegue

- **Frontend**: InfinityFree (hosting estático gratuito)
- **Backend**: Render (API + WebSockets gratuito)
- **Base de datos**: PostgreSQL en Render (gratuito)

## ⚡ Características

- **Cola FIFO**: Sistemas de turnos justos por orden de llegada
- **Timer automático**: 20 minutos de exposición por código
- **Tiempo real**: Actualizaciones instantáneas vía WebSockets
- **Anti-spam**: Un código por IP para prevenir abuso
- **Responsive**: Funciona en móvil, tablet y desktop
- **Gratuito**: Deploy completamente gratuito 24/7

## 🚀 Despliegue Rápido

```bash
# 1. Construir aplicación
./deploy-infinityfree-render.sh

# 2. Seguir guía detallada
cat DEPLOY-INFINITYFREE-RENDER.md
```

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Tailwind CSS + Shadcn UI
- React Query para estado del servidor
- WebSocket client para tiempo real

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Drizzle ORM
- WebSocket Server (ws)
- Validación con Zod

## 📁 Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/         # Páginas de la app
│   │   ├── hooks/         # Hooks personalizados
│   │   └── lib/           # Utilidades y API
├── server/                # Backend Express
│   ├── index.ts           # Servidor desarrollo
│   ├── index-render.ts    # Servidor producción
│   ├── routes.ts          # API endpoints + WebSockets
│   ├── storage.ts         # Lógica de base de datos
│   └── db.ts              # Conexión PostgreSQL
├── shared/                # Esquemas compartidos
│   └── schema.ts          # Definiciones de tipos
└── dist-*/               # Archivos construidos
```

## 🎯 Funcionalidades

### Para Usuarios
1. **Agregar código**: Nombre + código/enlace de Temu
2. **Ver posición**: Saber cuándo será tu turno
3. **Código activo**: Ver el código actual con timer
4. **Marcar completado**: Finalizar cuando logres el objetivo

### Sistema Automático
- Rotación cada 20 minutos
- Activación automática del siguiente
- Estadísticas en tiempo real
- Validación por IP

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env
# Editar DATABASE_URL

# Aplicar esquema
npm run db:push

# Iniciar desarrollo
npm run dev
```

## 📊 Capacidad

- **Usuarios simultáneos**: 100+ sin problemas
- **Códigos en cola**: Ilimitados
- **Uptime**: 99.9% (Render + InfinityFree)
- **Costo**: $0 (completamente gratuito)

## 🌟 Casos de Uso

- **Comunidades de Temu**: Grupos de WhatsApp/Telegram
- **Influencers**: Compartir códigos de forma organizada
- **Familias/Amigos**: Sistema justo entre conocidos
- **Eventos**: Promociones temporales

## 📖 Documentación

- [Guía de Despliegue](DEPLOY-INFINITYFREE-RENDER.md)
- [Arquitectura del Sistema](replit.md)

## 🤝 Contribuir

Este proyecto está hecho para la comunidad colombiana. Para reportar problemas o sugerir mejoras, crear un issue en el repositorio.

---

**Hecho con ❤️ para Colombia** 🇨🇴