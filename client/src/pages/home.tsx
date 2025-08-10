import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ActiveCodeCard } from "@/components/ActiveCodeCard";
import { QueueOverview } from "@/components/QueueOverview";
import { AddCodeForm } from "@/components/AddCodeForm";
import { QueueList } from "@/components/QueueList";
import { Users, Clock, Shield } from "lucide-react";

interface QueueData {
  queue?: any[];
  stats?: {
    total: number;
    active: number;
    waiting: number;
    completed: number;
  };
  activeEntry?: any;
}

export default function Home() {
  const { data: queueData, refetch } = useQuery<QueueData>({
    queryKey: ['/api/queue'],
  });

  // Connect to WebSocket for real-time updates
  const { isConnected } = useWebSocket(import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${import.meta.env.VITE_API_HOST || window.location.host}/ws`, {
    onMessage: (data) => {
      if (data.type === 'queue_update') {
        refetch();
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-temu-orange to-red-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Temu Referidos Colombia</h1>
                <p className="text-sm text-gray-500">Sistema de Cola Colaborativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium">{isConnected ? 'En línea' : 'Desconectado'}</span>
              </div>
              {/* Colombian Flag Colors */}
              <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
                <div className="h-2 bg-colombia-yellow"></div>
                <div className="h-1 bg-colombia-blue"></div>
                <div className="h-1 bg-red-500"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Active Code & Queue Status */}
          <div className="lg:col-span-2 space-y-6">
            <ActiveCodeCard data={queueData} />
            <QueueOverview data={queueData} />
          </div>

          {/* Right Column - Add Code Form & Full Queue */}
          <div className="space-y-6">
            <AddCodeForm onSuccess={() => refetch()} />
            <QueueList data={queueData} />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-colombia-blue to-blue-600">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>¿Cómo Funciona?</span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-temu-orange rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Agregar Código</h3>
                  <p className="text-sm text-gray-600">Comparte tu código de referido de Temu con tu nombre</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-colombia-yellow rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-900 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Esperar Turno</h3>
                  <p className="text-sm text-gray-600">Tu código entrará en la cola FIFO y esperará su turno</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-colombia-blue rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">20 Minutos Activo</h3>
                  <p className="text-sm text-gray-600">Cuando sea tu turno, tu código será visible por 20 minutos</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Marcar Completado</h3>
                  <p className="text-sm text-gray-600">Cuando logres tu objetivo, márcalo como completado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                Hecho con ❤️ para la comunidad colombiana
              </p>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">Powered by</span>
                <div className="flex space-x-1">
                  <div className="w-4 h-3 bg-colombia-yellow rounded-sm"></div>
                  <div className="w-4 h-3 bg-colombia-blue rounded-sm"></div>
                  <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{queueData?.stats?.total || 0}</span> usuarios totales
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Sistema 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
