#!/bin/bash

# Script para limpiar puertos ocupados
# Uso: ./scripts/clean-ports.sh

echo "🧹 Limpiando puertos 3000, 3001 y 8080..."

# Matar procesos en los puertos
for PORT in 3000 3001 8080; do
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ -n "$PID" ]; then
        echo "   Matando proceso en puerto $PORT (PID: $PID)"
        kill -9 $PID 2>/dev/null
    fi
done

# Verificar que los puertos están libres
echo ""
echo "✅ Verificando puertos..."
for PORT in 3000 3001 8080; do
    if lsof -ti:$PORT >/dev/null 2>&1; then
        echo "   ⚠️  Puerto $PORT aún ocupado"
    else
        echo "   ✓ Puerto $PORT libre"
    fi
done

echo ""
echo "✅ Limpieza completa"
