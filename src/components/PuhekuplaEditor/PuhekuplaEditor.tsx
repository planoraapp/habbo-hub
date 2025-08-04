
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, Shirt, Award, Sparkles, Settings } from 'lucide-react';
import EnhancedAvatarPreview from './EnhancedAvatarPreview';
import EnhancedItemGrid from './EnhancedItemGrid';
import { usePuhekuplaCategories, usePuhekuplaFurni, usePuhekuplaClothing, usePuhekuplaBadges } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaFurni, PuhekuplaClothing, PuhekuplaBadge } from '@/hooks/usePuhekuplaData';
import { PuhekuplaFigureManager, PuhekuplaFigure } from '@/lib/puhekuplaFigureManager';
import { useToast } from '@/hooks/use-toast';

const PuhekuplaEditor = () => {
  const [activeTab, setActiveTab] = useState('furni');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentFigure, setCurrentFigure] = useState<PuhekuplaFigure>(() => 
    PuhekuplaFigureManager.getDefaultFigure('M')
  );
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [currentPages, setCurrentPages] = useState({
    furni: 1,
    clothing: 1,
    badges: 1
  });
  
  const { toast } = useToast();

  // Load figure from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const figureParam = urlParams.get('figure');
    const genderParam = urlParams.get('gender') as 'M' | 'F';
    const hotelParam = urlParams.get('hotel');
    
    if (figureParam) {
      try {
        const figure = PuhekuplaFigureManager.parseFigureString(figureParam);
        setCurrentFigure(figure);
      } catch (error) {
        console.error('Error parsing figure from URL:', error);
      }
    }
    
    if (genderParam && ['M', 'F'].includes(genderParam)) {
      setSelectedGender(genderParam);
    }
    
    if (hotelParam) {
      setSelectedHotel(hotelParam);
    }
  }, []);

  const { data: categoriesData, isLoading: categoriesLoading } = usePuhekuplaCategories();
  const categories = categoriesData?.result?.categories || [];

  // Hook calls for each tab
  const { 
    data: furniData, 
    isLoading: furniLoading,
    error: furniError 
  } = usePuhekuplaFurni(
    currentPages.furni, 
    selectedCategory, 
    searchTerm
  );

  const { 
    data: clothingData, 
    isLoading: clothingLoading,
    error: clothingError 
  } = usePuhekuplaClothing(
    currentPages.clothing, 
    selectedCategory, 
    searchTerm
  );

  const { 
    data: badgesData, 
    isLoading: badgesLoading,
    error: badgesError 
  } = usePuhekuplaBadges(
    currentPages.badges, 
    searchTerm
  );

  // Debug logs
  useEffect(() => {
    console.log('🔍 [PuhekuplaEditor] Current data status:', {
      activeTab,
      furniData: furniData ? { 
        hasResult: !!furniData.result,
        furniCount: furniData.result?.furni?.length || 0,
        structure: Object.keys(furniData)
      } : 'no data',
      clothingData: clothingData ? {
        hasResult: !!clothingData.result,
        clothingCount: clothingData.result?.clothing?.length || 0,
        structure: Object.keys(clothingData)
      } : 'no data',
      badgesData: badgesData ? {
        hasResult: !!badgesData.result,
        badgesCount: badgesData.result?.badges?.length || 0,
        structure: Object.keys(badgesData)
      } : 'no data',
      categories: categories.length
    });
  }, [activeTab, furniData, clothingData, badgesData, categories]);

  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍' },
    { code: 'br', name: 'Habbo.com.br', flag: '🇧🇷' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪' },
  ];

  const handleItemSelect = (item: PuhekuplaFurni | PuhekuplaClothing | PuhekuplaBadge) => {
    console.log('Item selecionado:', item);
    
    if (activeTab === 'clothing') {
      const newFigure = PuhekuplaFigureManager.applyClothingItem(currentFigure, item);
      setCurrentFigure(newFigure);
      
      toast({
        title: "👕 Roupa aplicada!",
        description: `${item.name} foi adicionado ao seu avatar.`,
      });
    } else if (activeTab === 'badges') {
      toast({
        title: "🏆 Emblema selecionado!",
        description: `${item.name} foi selecionado. (Funcionalidade em desenvolvimento)`,
      });
    } else if (activeTab === 'furni') {
      toast({
        title: "🪑 Móvel selecionado!",
        description: `${item.name} foi selecionado. (Funcionalidade em desenvolvimento)`,
      });
    }
  };

  const handlePageChange = (tab: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tab]: page
    }));
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'furni':
        return {
          items: furniData?.result?.furni || [],
          loading: furniLoading,
          error: furniError,
          pagination: furniData?.pagination
        };
      case 'clothing':
        return {
          items: clothingData?.result?.clothing || [],
          loading: clothingLoading,
          error: clothingError,
          pagination: clothingData?.pagination
        };
      case 'badges':
        return {
          items: badgesData?.result?.badges || [],
          loading: badgesLoading,
          error: badgesError,
          pagination: badgesData?.pagination
        };
      default:
        return { items: [], loading: false, error: null, pagination: null };
    }
  };

  const tabData = getCurrentTabData();

  // Error display helper
  const renderErrorState = (error: any, type: string) => {
    if (!error) return null;
    
    console.error(`❌ [PuhekuplaEditor] ${type} error:`, error);
    
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-2">Erro ao carregar {type}</div>
        <div className="text-sm text-red-500">{error.message || 'Erro desconhecido'}</div>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Recarregar
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-4">
      {/* Avatar Preview */}
      <div className="lg:w-1/3">
        <EnhancedAvatarPreview
          currentFigure={currentFigure}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
          currentDirection={currentDirection}
          hotels={hotels}
          onFigureChange={setCurrentFigure}
          onDirectionChange={setCurrentDirection}
          onGenderChange={setSelectedGender}
          onHotelChange={setSelectedHotel}
        />
      </div>

      {/* Editor Tabs */}
      <div className="lg:w-2/3">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Editor Puhekupla - Nova Geração
              <Badge className="ml-auto bg-white/20 text-white">Beta</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="furni" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Móveis
                  <Badge variant="secondary" className="ml-1">
                    {furniData?.result?.furni?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="clothing" className="flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Roupas
                  <Badge variant="secondary" className="ml-1">
                    {clothingData?.result?.clothing?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Emblemas
                  <Badge variant="secondary" className="ml-1">
                    {badgesData?.result?.badges?.length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Buscar ${activeTab === 'furni' ? 'móveis' : activeTab === 'clothing' ? 'roupas' : 'emblemas'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {(activeTab === 'furni' || activeTab === 'clothing') && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Categorias</SelectItem>
                      {categories
                        .filter(category => category.guid && category.guid.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category.guid} value={category.slug || category.guid}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Content Tabs */}
              <div className="min-h-[500px]">
                <TabsContent value="furni" className="h-full">
                  {furniError ? renderErrorState(furniError, 'móveis') : (
                    <EnhancedItemGrid
                      items={tabData.items}
                      onItemSelect={handleItemSelect}
                      loading={tabData.loading}
                      type="furni"
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      category={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      categories={categories}
                      currentPage={currentPages.furni}
                      totalPages={tabData.pagination?.pages || 1}
                      onPageChange={(page) => handlePageChange('furni', page)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="clothing" className="h-full">
                  {clothingError ? renderErrorState(clothingError, 'roupas') : (
                    <EnhancedItemGrid
                      items={tabData.items}
                      onItemSelect={handleItemSelect}
                      loading={tabData.loading}
                      type="clothing"
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      category={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      categories={categories}
                      currentPage={currentPages.clothing}
                      totalPages={tabData.pagination?.pages || 1}
                      onPageChange={(page) => handlePageChange('clothing', page)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="badges" className="h-full">
                  {badgesError ? renderErrorState(badgesError, 'emblemas') : (
                    <EnhancedItemGrid
                      items={tabData.items}
                      onItemSelect={handleItemSelect}
                      loading={tabData.loading}
                      type="badges"
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      currentPage={currentPages.badges}
                      totalPages={tabData.pagination?.pages || 1}
                      onPageChange={(page) => handlePageChange('badges', page)}
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PuhekuplaEditor;
