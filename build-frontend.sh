#!/bin/bash

echo "🎨 Construyendo frontend para InfinityFree..."

# Create output directory
mkdir -p dist-frontend

# Build frontend with InfinityFree configuration
npx vite build --config vite.config.infinityfree.ts --mode production

if [ $? -eq 0 ]; then
    echo "✅ Frontend construido exitosamente en dist-frontend/"
    echo "📤 Sube estos archivos a htdocs/ en InfinityFree:"
    ls -la dist-frontend/
else
    echo "❌ Error construyendo frontend"
    exit 1
fi