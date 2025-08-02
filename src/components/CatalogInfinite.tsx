import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Package } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';
import IntelligentFurniImage from './IntelligentFurniImage';

interface FurniItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rarity: string;
  type: string;
  swfName: string;
  figureId: string;
}

interface FurniModalProps {
  furni: FurniItem;
  onClose: () => void;
}

const FurniModal = ({ furni, onClose }: FurniModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{furni.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg">
          <IntelligentFurniImage
            swfName={furni.swfName}
            name={furni.name}
            originalUrl={furni.imageUrl}
            size="lg"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="font-semibold">Categoria:</span> 
          <span className="ml-2 capitalize">{furni.category}</span>
        </div>
        
        <div>
          <span className="font-semibold">Tipo:</span> 
          <span className="ml-2 capitalize">{furni.type}</span>
        </div>
        
        <div>
          <span className="font-semibold">Raridade:</span> 
          <span className={`ml-2 capitalize ${furni.rarity === 'rare' ? 'text-purple-600' : 'text-gray-600'}`}>
            {furni.rarity}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Descrição:</span>
          <p className="mt-1 text-gray-600">{furni.description}</p>
        </div>
        
        {furni.swfName && (
          <div>
            <span className="font-semibold">Código:</span> 
            <span className="ml-2 font-mono text-sm">{furni.swfName}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const CatalogInfinite = () => {
  const [furnis, setFurnis] = useState<FurniItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFurni, setSelectedFurni] = useState<FurniItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchFurnis = useCallback(async (pageNum: number, category: string, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔄 Fetching enhanced furnis page ${pageNum}, category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('habbo-emotion-furnis', {
        body: { page: pageNum, limit: 60, category }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.furnis && Array.isArray(data.furnis)) {
        setFurnis(prev => reset ? data.furnis : [...prev, ...data.furnis]);
        setHasMore(data.metadata?.hasMore || false);
        
        if (data.metadata?.categories) {
          setCategories(['all', ...data.metadata.categories]);
        }
        
        console.log(`✅ Loaded ${data.furnis.length} enhanced furnis`);
      }
    } catch (error) {
      console.error('❌ Error fetching enhanced furnis:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    setFurnis([]);
    setPage(1);
    fetchFurnis(1, selectedCategory, true);
  }, [selectedCategory]);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFurnis(nextPage, selectedCategory);
    }
  };

  const filteredFurnis = furnis.filter(furni =>
    furni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    furni.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      'all': 'Todas as Categorias',
      'cadeiras': '🪑 Cadeiras',
      'mesas': '🪑 Mesas', 
      'camas': '🛏️ Camas',
      'sofas': '🛋️ Sofás',
      'plantas': '🌱 Plantas',
      'iluminacao': '💡 Iluminação',
      'parede': '🖼️ Itens de Parede',
      'piso': '📐 Pisos',
      'armazenamento': '📦 Armazenamento',
      'eletronicos': '📺 Eletrônicos',
      'diversos': '📦 Diversos'
    };
    return names[category] || category;
  };

  return (
    <div className="space-y-6">
      <PanelCard title="Catálogo de Móveis - Edição Aprimorada">
        <div className="space-y-4">
          {/* Enhanced Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar móveis por nome ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="habbo-input w-full pl-10 pr-4 py-3 text-base"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="habbo-input px-4 py-3 min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Furnis Grid */}
          <div className="bg-white border-2 border-gray-300 rounded-lg h-[700px] overflow-y-auto p-6">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
              {filteredFurnis.map((furni) => (
                <button
                  key={furni.id}
                  onClick={() => setSelectedFurni(furni)}
                  className={`group relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 
                    hover:from-blue-50 hover:to-indigo-100 border-2 border-gray-200 
                    hover:border-blue-300 rounded-lg p-3 transition-all duration-300 
                    hover:scale-105 hover:shadow-xl hover:-translate-y-1 transform-gpu`}
                  title={furni.name}
                >
                  {/* Rarity indicator */}
                  {furni.rarity !== 'common' && (
                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full shadow-lg ${
                      furni.rarity === 'legendary' ? 'bg-yellow-500' :
                      furni.rarity === 'rare' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                    </div>
                  )}
                  
                  {/* Furni image with intelligent loading */}
                  <div className="w-full h-full flex items-center justify-center">
                    <IntelligentFurniImage
                      swfName={furni.swfName}
                      name={furni.name}
                      originalUrl={furni.imageUrl}
                      size="md"
                      className="filter drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300"
                    />
                  </div>
                  
                  {/* Floating tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                    opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300
                    bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 
                    shadow-lg max-w-32 truncate">
                    {furni.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Enhanced Load More Button */}
            {hasMore && filteredFurnis.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="habbo-button-blue px-8 py-3 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Carregando Móveis...
                    </span>
                  ) : (
                    'Carregar Mais Móveis'
                  )}
                </button>
              </div>
            )}

            {/* Enhanced Loading State */}
            {loading && filteredFurnis.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
                  <p className="text-gray-600 text-lg font-semibold">Carregando Catálogo Aprimorado...</p>
                  <p className="text-gray-500 text-sm mt-2">Buscando móveis nas melhores fontes</p>
                </div>
              </div>
            )}

            {/* Enhanced Empty State */}
            {!loading && filteredFurnis.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-600 text-xl font-semibold mb-2">Nenhum móvel encontrado</p>
                <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
              </div>
            )}
          </div>

          {/* Enhanced Statistics */}
          <div className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-3">
            <div className="flex justify-center items-center gap-6">
              <span className="flex items-center gap-1">
                📊 <strong>Total:</strong> {furnis.length} móveis
              </span>
              <span className="flex items-center gap-1">
                🔍 <strong>Filtrados:</strong> {filteredFurnis.length}
              </span>
              <span className="flex items-center gap-1">
                🏆 <strong>Raros:</strong> {furnis.filter(f => f.rarity !== 'common').length}
              </span>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Enhanced Modal */}
      {selectedFurni && (
        <FurniModal
          furni={selectedFurni}
          onClose={() => setSelectedFurni(null)}
        />
      )}
    </div>
  );
};
