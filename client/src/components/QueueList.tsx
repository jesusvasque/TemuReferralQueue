import { List } from "lucide-react";

interface QueueListProps {
  data?: {
    queue?: any[];
  };
}

export function QueueList({ data }: QueueListProps) {
  const queue = data?.queue || [];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateWaitTime = (position: number, isActive: boolean) => {
    if (isActive) return "Activo";
    
    const activeEntry = queue.find(entry => entry.isActive);
    if (!activeEntry) return "Próximo";
    
    const totalMinutes = (position - 1) * 20;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (entry: any) => {
    if (entry.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Activo
        </span>
      );
    }
    
    if (entry.position === 2) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Próximo
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {calculateWaitTime(entry.position, entry.isActive)}
      </span>
    );
  };

  const displayedQueue = queue.slice(0, 5); // Show first 5 entries
  const hasMore = queue.length > 5;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <List className="w-5 h-5 text-colombia-blue" />
          <span>Cola Completa</span>
        </h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {displayedQueue.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No hay usuarios en la cola</p>
            <p className="text-sm text-gray-400 mt-1">¡Sé el primero en agregar tu código!</p>
          </div>
        ) : (
          displayedQueue.map((entry) => (
            <div 
              key={entry.id}
              className={`px-6 py-4 ${entry.isActive ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {entry.position}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{entry.name}</p>
                    <p className={`text-sm ${entry.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {entry.referralCode} - {entry.isActive ? 'Activo' : 'En cola'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(entry)}
                  {!entry.isActive && entry.position > 1 && (
                    <p className="text-xs text-gray-500 mt-1">Espera estimada</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <div className="px-6 py-4 text-center bg-gray-50">
            <button className="text-temu-orange hover:text-red-500 font-medium text-sm transition-colors">
              Ver todos los {queue.length} en cola →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
