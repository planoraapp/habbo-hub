
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarPreview from './HabboEditor/AvatarPreview';
import HybridClothingSelector from './HabboEditor/HybridClothingSelector';
import ColorPalette from './HabboEditor/ColorPalette';
import { useHybridClothingData, HybridClothingItem } from '@/hooks/useHybridClothingData';
import { 
  CurrentFigure, 
  currentFigureToString, 
  updateFigureWithItem, 
  generateRandomFigure,
  DEFAULT_FIGURE,
  getCurrentPartForCategory
} from '@/lib/hybridFigureMapper';

const HABBO_COLORS = [
  { id: '1', hex: '#F5DA88', name: 'Pele Clara' },
  { id: '2', hex: '#FFDBC1', name: 'Pele Rosa' },
  { id: '3', hex: '#FFCB98', name: 'Pele Bronzeada' },
  { id: '4', hex: '#F4AC54', name: 'Pele Dourada' },
  { id: '5', hex: '#CA8154', name: 'Pele Morena' },
  { id: '45', hex: '#D4B878', name: 'Loiro' },
  { id: '61', hex: '#000000', name: 'Preto' },
  { id: '92', hex: '#FFFFFF', name: 'Branco' },
  { id: '100', hex: '#E3AE7D', name: 'Bege' },
  { id: '101', hex: '#C99263', name: 'Marrom' },
  { id: '102', hex: '#A76644', name: 'Marrom Escuro' },
  { id: '104', hex: '#FFC680', name: 'Laranja' },
  { id: '105', hex: '#FF8C40', name: 'Laranja Escuro' },
  { id: '106', hex: '#FF5757', name: 'Vermelho' },
  { id: '143', hex: '#6799CC', name: 'Azul' }
];

const HabboHubEditor = () => {
  console.log('🚀 [HabboHubEditor] Iniciando Editor Híbrido...');
  
  const { toast } = useToast();
  
  const [currentFigure, setCurrentFigure] = useState<CurrentFigure>(DEFAULT_FIGURE);
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [username, setUsername] = useState('ViaJovem');
  const [activeCategory, setActiveCategory] = useState('hr');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Use hybrid clothing data
  const { data: clothingData, isLoading: apiLoading, error, refetch } = useHybridClothingData(selectedHotel);

  // Generate figure string dynamically from current figure
  const figureString = useMemo(() => {
    return currentFigureToString(currentFigure);
  }, [currentFigure]);

  // Get available colors for current category
  const availableColors = useMemo(() => {
    if (!clothingData) return [];
    
    const currentPart = getCurrentPartForCategory(currentFigure, activeCategory);
    if (!currentPart) return [];
    
    // Find the item that matches current part
    const matchingItem = clothingData.find(item => 
      item.category === activeCategory && 
      (item.figureId === currentPart.id || item.swfName.includes(currentPart.id))
    );
    
    return matchingItem?.colors || [];
  }, [clothingData, currentFigure, activeCategory]);

  // Update selected part when category changes
  useEffect(() => {
    const currentPart = getCurrentPartForCategory(currentFigure, activeCategory);
    if (currentPart && clothingData) {
      const matchingItem = clothingData.find(item => 
        item.category === activeCategory && 
        (item.figureId === currentPart.id || item.swfName.includes(currentPart.id))
      );
      setSelectedPart(matchingItem?.id || '');
    } else {
      setSelectedPart('');
    }
  }, [activeCategory, currentFigure, clothingData]);

  useEffect(() => {
    console.log('🔍 [HabboHubEditor] Sistema Híbrido Status:', {
      loading: apiLoading,
      hasData: !!clothingData,
      totalItems: clothingData?.length || 0,
      error: error?.message,
      figureString
    });
    
    if (clothingData) {
      const stats = {
        hybrid: clothingData.filter(i => i.source === 'hybrid').length,
        official: clothingData.filter(i => i.source === 'official').length,
        habbowidgets: clothingData.filter(i => i.source === 'habbowidgets').length
      };
      console.log('📦 [HabboHubEditor] Dados híbridos carregados:', stats);
    }
  }, [apiLoading, clothingData, error, figureString]);

  const handlePartSelect = useCallback((item: HybridClothingItem) => {
    console.log('👕 [HabboHubEditor] Item híbrido selecionado:', item);
    setSelectedPart(item.id);
    
    // Update figure with new item
    setCurrentFigure(prev => {
      const updated = updateFigureWithItem(prev, item);
      console.log('🔄 [HabboHubEditor] Figura atualizada:', updated);
      return updated;
    });

    toast({
      title: "Item Aplicado!",
      description: `${item.name} foi aplicado ao seu visual (${item.source.toUpperCase()}).`
    });
  }, [toast]);

  const handleColorSelect = useCallback((colorId: string) => {
    console.log('🎨 [HabboHubEditor] Cor selecionada:', colorId, 'para categoria:', activeCategory);
    
    setCurrentFigure(prev => {
      const currentPart = prev[activeCategory as keyof CurrentFigure];
      if (!currentPart) return prev;
      
      const updated = {
        ...prev,
        [activeCategory]: {
          ...currentPart,
          colors: [colorId]
        }
      };
      console.log('🔄 [HabboHubEditor] Cor atualizada na figura:', updated);
      return updated;
    });
  }, [activeCategory]);

  const handleRandomize = useCallback(() => {
    if (!clothingData || clothingData.length === 0) {
      toast({
        title: "Erro",
        description: "Dados híbridos não carregados ainda.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('🎲 [HabboHubEditor] Randomizando avatar com sistema híbrido...');
    setIsRandomizing(true);
    
    setTimeout(() => {
      const randomFigure = generateRandomFigure(clothingData);
      setCurrentFigure(randomFigure);
      setIsRandomizing(false);
      
      toast({
        title: "Avatar Randomizado!",
        description: "Um novo visual foi gerado com o sistema híbrido."
      });
    }, 1000);
  }, [clothingData, toast]);

  const handleCopyUrl = useCallback(async () => {
    const url = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&size=l&img_format=png&gesture=std&action=std`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copiada!",
        description: "A URL da imagem foi copiada para a área de transferência."
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL.",
        variant: "destructive"
      });
    }
  }, [figureString, selectedHotel, toast]);

  const handleExportFigure = useCallback(() => {
    const data = {
      figure: figureString,
      figureObject: currentFigure,
      username,
      hotel: selectedHotel,
      exportDate: new Date().toISOString(),
      source: 'HybridSystem',
      dataStats: {
        hybrid: clothingData?.filter(i => i.source === 'hybrid').length || 0,
        official: clothingData?.filter(i => i.source === 'official').length || 0,
        habbowidgets: clothingData?.filter(i => i.source === 'habbowidgets').length || 0
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habbo-hybrid-figure-${username}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Figure Exportada!",
      description: "O arquivo foi baixado com dados do sistema híbrido."
    });
  }, [figureString, currentFigure, username, selectedHotel, clothingData, toast]);

  if (error) {
    console.log('❌ [HabboHubEditor] Rendering error state');
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600 mb-2">Erro no Editor Híbrido</h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados do sistema híbrido.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (apiLoading || isRandomizing) {
    console.log('⏳ [HabboHubEditor] Rendering loading state');
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-600 mb-2">Editor Híbrido de Visuais</h2>
          <p className="text-gray-600">
            {isRandomizing ? 'Gerando visual aleatório...' : 'Carregando sistema híbrido...'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-96 w-full" /></div>
          <div><Skeleton className="h-48 w-full" /></div>
        </div>
      </div>
    );
  }

  console.log('✅ [HabboHubEditor] Rendering main hybrid editor interface');

  const totalItems = clothingData?.length || 0;
  const sourceStats = {
    hybrid: clothingData?.filter(i => i.source === 'hybrid').length || 0,
    official: clothingData?.filter(i => i.source === 'official').length || 0,
    habbowidgets: clothingData?.filter(i => i.source === 'habbowidgets').length || 0
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-amber-600 mb-2 volter-font">Editor Híbrido de Visuais</h2>
        <p className="text-gray-600">Sistema híbrido com múltiplas fontes de dados!</p>
        <div className="flex justify-center gap-2 mt-2 flex-wrap">
          <Badge className="bg-purple-600 text-white">
            Híbrido: {sourceStats.hybrid}
          </Badge>
          <Badge className="bg-blue-600 text-white">
            Oficial: {sourceStats.official}
          </Badge>
          <Badge className="bg-green-600 text-white">
            Widgets: {sourceStats.habbowidgets}
          </Badge>
          <Badge className="bg-amber-600 text-white">
            Total: {totalItems}
          </Badge>
          <Badge className="bg-gray-700 text-white">
            Hotel: {selectedHotel}
          </Badge>
        </div>
      </div>

      {/* Success Alert */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img src="/assets/2190__-5kz.png" alt="Sucesso" className="w-6 h-6" />
            <p className="text-sm text-purple-800">
              <strong>🔥 Sistema Híbrido Ativo!</strong> Combinando dados oficiais Habbo + HabboWidgets 
              ({totalItems} itens disponíveis). Preview sincronizado em tempo real.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AvatarPreview
            figureString={figureString}
            selectedHotel={selectedHotel}
            setSelectedHotel={setSelectedHotel}
            username={username}
            setUsername={setUsername}
            onRandomize={handleRandomize}
            onCopyUrl={handleCopyUrl}
            onExportFigure={handleExportFigure}
          />
        </div>

        <div className="lg:col-span-1">
          <HybridClothingSelector
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedPart={selectedPart}
            onPartSelect={handlePartSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedHotel={selectedHotel}
          />
        </div>

        <div className="lg:col-span-1">
          <ColorPalette
            colors={HABBO_COLORS}
            availableColors={availableColors}
            selectedColor={getCurrentPartForCategory(currentFigure, activeCategory)?.colors[0]}
            onColorSelect={handleColorSelect}
          />
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <details>
              <summary className="text-sm font-bold cursor-pointer">Debug Info</summary>
              <pre className="text-xs mt-2 overflow-auto">
{JSON.stringify({
  figureString,
  currentFigure,
  activeCategory,
  selectedPart,
  availableColors: availableColors.slice(0, 5),
  sourceStats
}, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HabboHubEditor;
