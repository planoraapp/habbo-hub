
import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import IntelligentFurniImageV2 from './IntelligentFurniImageV2';

interface HabboFurniItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  source: string;
}

const CATALOG_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🏠' },
  { id: 'room_decorations', name: 'Decorações', icon: '🖼️' },
  { id: 'furniture', name: 'Móveis', icon: '🪑' },
  { id: 'lighting', name: 'Iluminação', icon: '💡' },
  { id: 'garden', name: 'Jardim', icon: '🌱' },
  { id: 'pets', name: 'Pets', icon: '🐕' },
  { id: 'clothing', name: 'Roupas', icon: '👕' },
  { id: 'effects', name: 'Efeitos', icon: '✨' }
];

const fetchCatalogItems = async (category: string, search: string) => {
  const { data, error } = await supabase.functions.invoke('habbo-furni-api', {
    body: {
      limit: 50,
      offset: 0,
      search,
      category: category === 'all' ? '' : category
    }
  });

  if (error) throw error;
  return data?.furnis || [];
};

export const CatalogWithTabs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: furnis, isLoading } = useQuery({
    queryKey: ['catalog-furnis', selectedCategory, search],
    queryFn: () => fetchCatalogItems(selectedCategory, search),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Sidebar com Abas */}
      <div className="w-48 bg-gray-50 border-r flex-shrink-0">
        <div className="p-3 border-b bg-blue-600 text-white">
          <h3 className="font-bold text-sm">Catálogo</h3>
        </div>
        <div className="overflow-y-auto">
          {CATALOG_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full p-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm ${
                selectedCategory === category.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header com Busca */}
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar móveis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Grid de Móveis */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
              {Array.from({ length: 50 }, (_, i) => (
                <Skeleton key={i} className="aspect-square rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
              {furnis?.map((furni: HabboFurniItem) => (
                <div
                  key={furni.id}
                  className="aspect-square p-1 rounded transition-transform duration-150 hover:scale-105 hover:shadow-md bg-gray-50 hover:bg-gray-100"
                  title={furni.name}
                >
                  <IntelligentFurniImageV2
                    swfName={furni.name}
                    name={furni.name}
                    originalUrl={furni.imageUrl}
                    className="w-full h-full"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
