
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserCardProps {
  habboData: {
    name: string;
    habbo_id: string;
    figureString?: string;
  };
  isOwner?: boolean;
}

export const UserCard = ({ habboData, isOwner }: UserCardProps) => {
  const avatarUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboData.name}&direction=2&head_direction=2&gesture=std&size=l&action=std`;

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200 shadow-lg">
      <div className="flex items-center gap-4 h-full">
        {/* Avatar maior e mais visível */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden border-3 border-white shadow-lg bg-white">
            <img 
              src={avatarUrl} 
              alt={habboData.name}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/frank.png';
              }}
            />
          </div>
        </div>
        
        {/* Informações do usuário */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800 volter-font truncate">
              {habboData.name}
            </h2>
            {isOwner && (
              <Badge className="bg-green-500 text-white text-xs volter-font">
                Sua Home
              </Badge>
            )}
          </div>
          
          {/* Informações adicionais */}
          <div className="space-y-1">
            <p className="text-sm text-gray-600 volter-font">
              📅 Membro desde: Janeiro 2024
            </p>
            <p className="text-sm text-gray-600 volter-font">
              🏆 Nível: Veterano
            </p>
            <p className="text-sm text-gray-600 volter-font">
              ⭐ Reputação: Excelente
            </p>
          </div>

          {/* Status online */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-xs text-green-600 volter-font font-medium">
              Online agora
            </span>
          </div>
        </div>
        
        {/* Decoração lateral */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg flex items-center justify-center border-2 border-white shadow-md">
            <span className="text-2xl">🏠</span>
          </div>
        </div>
      </div>
    </div>
  );
};
