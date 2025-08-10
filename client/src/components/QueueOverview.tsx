import { Clock, ArrowRight } from "lucide-react";

interface QueueOverviewProps {
  data?: {
    queue?: any[];
    stats?: {
      total: number;
      active: number;
      waiting: number;
      completed: number;
    };
  };
}

export function QueueOverview({ data }: QueueOverviewProps) {
  const stats = data?.stats || { total: 0, active: 0, waiting: 0, completed: 0 };
  const queue = data?.queue || [];
  
  const nextUser = queue.find(entry => !entry.isActive && !entry.isCompleted);
  
  const calculateWaitTime = (position: number) => {
    const activeEntry = queue.find(entry => entry.isActive);
    if (!activeEntry || position <= 1) return "Próximo";
    
    // Estimate 20 minutes per position
    const totalMinutes = (position - 1) * 20;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-colombia-blue" />
            <span>Estado de la Cola</span>
          </h2>
          <div className="text-sm text-gray-500">
            En vivo
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Queue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-colombia-blue">{stats.total}</div>
            <div className="text-xs text-gray-600">Total en Cola</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-600">Activo Ahora</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-colombia-yellow">{stats.waiting}</div>
            <div className="text-xs text-gray-600">Esperando</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">Completados</div>
          </div>
        </div>

        {/* Next Up */}
        {nextUser ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <ArrowRight className="w-4 h-4 text-temu-orange" />
              <span>Próximo en la Cola</span>
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-colombia-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{getInitials(nextUser.name)}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{nextUser.name}</p>
                <p className="text-sm text-gray-500">
                  Posición #{nextUser.position} - {calculateWaitTime(nextUser.position)}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Esperando
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-500">No hay más usuarios en cola</p>
          </div>
        )}
      </div>
    </div>
  );
}
