import { useState, useEffect } from "react";
import { Crown, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ActiveCodeCardProps {
  data?: {
    activeEntry?: any;
    queue?: any[];
    stats?: any;
  };
}

export function ActiveCodeCard({ data }: ActiveCodeCardProps) {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const activeEntry = data?.activeEntry;

  useEffect(() => {
    if (!activeEntry?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(activeEntry.expiresAt).getTime();
      const remaining = expires - now;

      if (remaining <= 0) {
        setTimeRemaining("00:00");
        setProgress(100);
        return;
      }

      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      // Calculate progress (20 minutes = 1200000ms)
      const totalTime = 20 * 60 * 1000;
      const elapsed = totalTime - remaining;
      setProgress(Math.max(0, Math.min(100, (elapsed / totalTime) * 100)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry?.expiresAt]);

  const handleMarkCompleted = async () => {
    if (!activeEntry) return;

    try {
      await apiRequest("POST", `/api/queue/${activeEntry.id}/complete`);
      toast({
        title: "¡Excelente!",
        description: "Tu código ha sido marcado como completado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar como completado",
        variant: "destructive",
      });
    }
  };

  if (!activeEntry) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <Crown className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Sin Código Activo</h2>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center space-y-4">
            <p className="text-gray-500">No hay códigos activos en este momento</p>
            <p className="text-sm text-gray-400">¡Agrega tu código para comenzar!</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-temu-orange to-red-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Crown className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Código Activo Actual</h2>
          </div>
          <div className="text-white text-sm opacity-90">
            {timeRemaining} restantes
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="text-center space-y-4">
          {/* Active User Info */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-temu-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{getInitials(activeEntry.name)}</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{activeEntry.name}</h3>
              <p className="text-sm text-gray-500">Posición #{activeEntry.position} - Activo ahora</p>
            </div>
          </div>

          {/* Referral Code Display */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 font-medium">Código de Referido</p>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <span className="text-xl font-mono font-bold text-temu-orange break-all">
                  {activeEntry.referralCode}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Copia este código o{" "}
                {activeEntry.referralCode.startsWith('http') ? (
                  <a 
                    href={activeEntry.referralCode} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-temu-orange hover:underline inline-flex items-center space-x-1"
                  >
                    <span>usa este enlace</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-temu-orange">visita Temu</span>
                )}
              </p>
            </div>
          </div>

          {/* Timer Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiempo transcurrido</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-temu-orange h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Completion Button */}
          <Button 
            onClick={handleMarkCompleted}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>¡Completé mi objetivo!</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
