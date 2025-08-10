import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede tener más de 50 caracteres"),
  referralCode: z.string().min(3, "El código de referido es requerido").max(500, "El código es muy largo"),
});

type FormData = z.infer<typeof formSchema>;

interface AddCodeFormProps {
  onSuccess?: () => void;
}

export function AddCodeForm({ onSuccess }: AddCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/queue", data);
      
      toast({
        title: "¡Código agregado!",
        description: "Tu código ha sido agregado a la cola exitosamente",
      });
      
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el código a la cola",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <PlusCircle className="w-5 h-5 text-temu-orange" />
          <span>Agregar a la Cola</span>
        </h2>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Input */}
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tu Nombre
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ingresa tu nombre"
              {...register("name")}
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Referral Code Input */}
          <div>
            <Label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
              Código de Referido
            </Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Ej: ACM12X89 o enlace completo"
              {...register("referralCode")}
              className={`w-full ${errors.referralCode ? 'border-red-500' : ''}`}
            />
            {errors.referralCode && (
              <p className="text-red-500 text-xs mt-1">{errors.referralCode.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Puedes usar el código corto o el enlace completo de Temu
            </p>
          </div>

          {/* IP Validation Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-colombia-blue mt-0.5" />
              <div>
                <p className="text-sm text-colombia-blue font-medium">Sistema Anti-Spam</p>
                <p className="text-xs text-gray-600">Solo puedes agregar un código por IP hasta completar el actual</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-temu-orange hover:bg-red-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{isSubmitting ? 'Agregando...' : 'Unirme a la Cola'}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
