import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { PuhekuplaAvatarPreviewClean } from './PuhekuplaAvatarPreviewClean';
import OfficialClothingGrid from '@/components/HabboEditor/OfficialClothingGrid';
import { PuhekuplaFigureManager, PuhekuplaFigure, FigurePart } from '@/lib/puhekuplaFigureManager';
import { useToast } from '@/hooks/use-toast';
import { useOfficialHabboFigureData, type OfficialHabboItem } from '@/hooks/useOfficialHabboFigureData';

// Configuração das categorias oficiais do Habbo (baseado na documentação ViaJovem)
const categoryGroups = [
  {
    id: 'head',
    name: 'Cabeça e Acessórios',
    icon: '👤',
    categories: [
      { id: 'hd', name: 'Rosto', icon: '👤' },
      { id: 'hr', name: 'Cabelos', icon: '💇' },
      { id: 'ea', name: 'Óculos', icon: '👓' },
      { id: 'ha', name: 'Chapéus', icon: '🎩' },
      { id: 'fa', name: 'Máscaras', icon: '🎭' }
    ]
  },
  {
    id: 'body',
    name: 'Corpo e Roupas',
    icon: '👕',
    categories: [
      { id: 'ch', name: 'Camisetas', icon: '👕' },
      { id: 'cc', name: 'Casacos', icon: '🧥' },
      { id: 'ca', name: 'Bijuteria', icon: '💍' },
      { id: 'cp', name: 'Estampas', icon: '🎨' }
    ]
  },
  {
    id: 'legs',
    name: 'Pernas e Pés',
    icon: '👖',
    categories: [
      { id: 'lg', name: 'Calças', icon: '👖' },
      { id: 'sh', name: 'Sapatos', icon: '👟' },
      { id: 'wa', name: 'Cintos', icon: '🔗' }
    ]
  }
];

const OfficialHabboEditor = () => {
  const [currentFigure, setCurrentFigure] = useState<PuhekuplaFigure>(() => 
    PuhekuplaFigureManager.getDefaultFigure('M')
  );
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedItem, setSelectedItem] = useState('');
  
  const { toast } = useToast();
  const { data: officialData, refetch, isLoading } = useOfficialHabboFigureData();

  // Hotéis disponíveis
  const hotels = [
    { code: 'com', name: 'Habbo.com', flag: '🌍', url: 'habbo.com' },
    { code: 'com.br', name: 'Habbo.com.br', flag: '🇧🇷', url: 'habbo.com.br' },
    { code: 'es', name: 'Habbo.es', flag: '🇪🇸', url: 'habbo.es' },
    { code: 'fr', name: 'Habbo.fr', flag: '🇫🇷', url: 'habbo.fr' },
    { code: 'de', name: 'Habbo.de', flag: '🇩🇪', url: 'habbo.de' },
    { code: 'it', name: 'Habbo.it', flag: '🇮🇹', url: 'habbo.it' },
    { code: 'fi', name: 'Habbo.fi', flag: '🇫🇮', url: 'habbo.fi' }
  ];

  // Load figure from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const figureParam = urlParams.get('figure');
    const genderParam = urlParams.get('gender') as 'M' | 'F' | 'U';
    const hotelParam = urlParams.get('hotel');
    
    if (figureParam) {
      try {
        const figure = PuhekuplaFigureManager.parseFigureString(figureParam);
        setCurrentFigure(figure);
      } catch (error) {
        console.error('Error parsing figure from URL:', error);
      }
    }
    
    if (genderParam && ['M', 'F', 'U'].includes(genderParam)) {
      setSelectedGender(genderParam);
    }
    
    if (hotelParam) {
      setSelectedHotel(hotelParam);
    }
  }, []);

  const handleItemSelect = (item: OfficialHabboItem) => {
    console.log('🎯 [OfficialEditor] Item oficial selecionado:', item);
    
    setSelectedItem(item.id);
    
    // Aplicar item usando o padrão oficial do Habbo
    const updatedFigure = applyOfficialItem(currentFigure, item);
    setCurrentFigure(updatedFigure);
    
    toast({
      title: "✨ Item oficial aplicado!",
      description: `${item.category.toUpperCase()}-${item.id} foi aplicado ao seu avatar.`,
    });
  };

  // Aplicar item oficial ao avatar
  const applyOfficialItem = (figure: PuhekuplaFigure, item: OfficialHabboItem): PuhekuplaFigure => {
    const newFigure = { ...figure };
    const newPart: FigurePart = {
      category: item.category,
      id: item.id,
      colors: [item.colors[0] || '1']
    };
    
    // Aplicar o item na categoria correspondente usando as propriedades corretas do PuhekuplaFigure
    switch (item.category) {
      case 'hd': newFigure.hd = newPart; break;
      case 'hr': newFigure.hr = newPart; break;
      case 'ch': newFigure.ch = newPart; break;
      case 'lg': newFigure.lg = newPart; break;
      case 'sh': newFigure.sh = newPart; break;
      case 'ha': newFigure.ha = newPart; break;
      case 'ea': newFigure.ea = newPart; break;
      case 'fa': newFigure.fa = newPart; break;
      case 'cc': newFigure.cc = newPart; break;
      case 'ca': newFigure.ca = newPart; break;
      case 'wa': newFigure.wa = newPart; break;
      case 'cp': newFigure.cp = newPart; break;
    }
    
    return newFigure;
  };

  // Update selected category when section changes
  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection]);

  // Update figure when gender changes
  const handleGenderChange = (gender: 'M' | 'F' | 'U') => {
    console.log('👤 [OfficialEditor] Mudança de gênero:', gender);
    setSelectedGender(gender);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Avatar Preview (Esquerda) */}
      <div className="lg:w-80">
        <Card>
          <CardContent className="p-4">
            <PuhekuplaAvatarPreviewClean
              currentFigure={currentFigure}
              selectedGender={selectedGender === 'U' ? 'M' : selectedGender}
              selectedHotel={selectedHotel}
              currentDirection={currentDirection}
              hotels={hotels}
              onFigureChange={setCurrentFigure}
              onDirectionChange={setCurrentDirection}
              onGenderChange={handleGenderChange}
              onHotelChange={setSelectedHotel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Editor Tabs (Direita) */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Editor Oficial do Habbo
              <Badge className="ml-auto bg-white/20 text-white text-xs">
                {selectedGender === 'M' ? 'Masculino' : selectedGender === 'F' ? 'Feminino' : 'Unissex'}
              </Badge>
              <Button 
                onClick={() => refetch()} 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={selectedSection} onValueChange={setSelectedSection} className="h-full">
              {/* Abas Principais */}
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {categoryGroups.map(group => (
                  <TabsTrigger 
                    key={group.id} 
                    value={group.id} 
                    className="text-xs px-3 py-2"
                  >
                    <div className="text-center">
                      <div className="text-base">{group.icon}</div>
                      <div className="text-[10px] mt-1">{group.name}</div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Conteúdo das Abas */}
              {categoryGroups.map(group => (
                <TabsContent key={group.id} value={group.id} className="min-h-[500px]">
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-blue-800">{group.name}</h3>
                    <p className="text-sm text-gray-600">
                      Dados oficiais do Habbo - Gênero: {selectedGender}
                      {officialData && (
                        <span className="text-green-600 ml-2">
                          • {Object.values(officialData).reduce((sum, items) => sum + items.length, 0)} itens carregados
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Sub-categorias */}
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList 
                      className="grid gap-1 mb-4" 
                      style={{ gridTemplateColumns: `repeat(${group.categories.length}, 1fr)` }}
                    >
                      {group.categories.map(category => (
                        <TabsTrigger 
                          key={category.id} 
                          value={category.id} 
                          className="text-xs px-2 py-2"
                        >
                          <div className="text-center">
                            <div className="text-sm">{category.icon}</div>
                            <div className="text-[9px] mt-1">{category.name}</div>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Official Clothing Grids */}
                    {group.categories.map(category => (
                      <TabsContent key={category.id} value={category.id}>
                        <OfficialClothingGrid 
                          selectedCategory={category.id}
                          selectedGender={selectedGender}
                          onItemSelect={handleItemSelect}
                          selectedItem={selectedItem}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficialHabboEditor;