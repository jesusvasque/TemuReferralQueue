#!/bin/bash

echo "📦 Construyendo backend para Render..."

# Create output directory
mkdir -p dist-backend

# Build backend with optimized bundle
npx esbuild server/index-render.ts --platform=node --packages=external --bundle --format=esm --outdir=dist-backend

if [ $? -eq 0 ]; then
    echo "✅ Backend construido exitosamente en dist-backend/"
    echo "🚀 Listo para deploy en Render"
    echo ""
    echo "📋 Próximos pasos para Render:"
    echo "  1. Configura Web Service con Build Command: chmod +x build-backend.sh && ./build-backend.sh"
    echo "  2. Configura Start Command: node dist-backend/index-render.js"
    echo "  3. Variables de entorno requeridas:"
    echo "     - DATABASE_URL (PostgreSQL en Render)"
    echo "     - NODE_ENV=production"
    echo "     - FRONTEND_URLS=https://referidostemuco.infinityfree.me"
else
    echo "❌ Error construyendo backend"
    exit 1
fi
