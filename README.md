#!/bin/bash

echo "🚀 Despliegue completo: InfinityFree + Render + PostgreSQL"
echo "======================================================="

# Build frontend for InfinityFree
echo ""
echo "1️⃣ Construyendo FRONTEND para InfinityFree..."
./build-frontend.sh

# Build backend for Render
echo ""
echo "2️⃣ Construyendo BACKEND para Render..."
./build-backend.sh

echo ""
echo "✅ CONSTRUCCIÓN COMPLETADA"
echo ""
echo "📋 MANUAL DE DESPLIEGUE:"
echo ""
echo "🔗 BACKEND (Render.com):"
echo "   1. Crea cuenta en render.com"
echo "   2. Nuevo PostgreSQL Database → Guarda DATABASE_URL"
echo "   3. Nuevo Web Service desde GitHub:"
echo "      • Build Command: chmod +x build-backend.sh && ./build-backend.sh"
echo "      • Start Command: node dist-backend/index-render.js"
echo "   4. Variables de entorno:"
echo "      NODE_ENV=production"
echo "      DATABASE_URL=[tu-database-url]"
echo "      FRONTEND_URLS=https://[tu-sitio].infinityfreeapp.com"
echo ""
echo "🌐 FRONTEND (InfinityFree):"
echo "   1. Crea cuenta en infinityfree.com"
echo "   2. Sube archivos de dist-frontend/ a htdocs/"
echo "   3. Actualiza client/.env.production con tu URL de Render"
echo "   4. Reconstruye frontend con tu URL final"
echo ""
echo "🗄️ BASE DE DATOS:"
echo "   Después del primer deploy, ejecuta en Render Shell:"
echo "   npm run db:push"
echo ""
echo "📁 Archivos listos:"
echo "   📦 Backend: dist-backend/ (para Render)"
echo "   🎨 Frontend: dist-frontend/ (para InfinityFree)"
