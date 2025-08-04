
export interface ViaJovemFigure {
  [key: string]: {
    id: string;
    color: string;
  };
}

export class ViaJovemFigureManager {
  static getDefaultFigure(gender: 'M' | 'F' | 'U'): ViaJovemFigure {
    const baseFigure: ViaJovemFigure = {
      hd: { id: '180', color: '1' }, // Rosto com cor de pele padrão
      ch: { id: '255', color: '61' }, // Camiseta azul
      lg: { id: '280', color: '92' }, // Calça dourada
      sh: { id: '305', color: '1' }   // Sapatos brancos
    };

    if (gender === 'F') {
      return {
        ...baseFigure,
        hr: { id: '600', color: '45' } // Cabelo feminino castanho
      };
    }

    return {
      ...baseFigure,
      hr: { id: '205', color: '45' } // Cabelo masculino castanho
    };
  }

  static parseFigureString(figureString: string): ViaJovemFigure {
    const parts = figureString.split('.');
    const figure: ViaJovemFigure = {};

    parts.forEach(part => {
      const [type, details] = part.split('-');
      if (details) {
        const detailParts = details.split('-');
        const id = detailParts[0];
        const color = detailParts[1] || '1';
        figure[type] = { id, color };
      }
    });

    return figure;
  }

  static applyClothingItem(
    currentFigure: ViaJovemFigure, 
    item: any, 
    colorId: string
  ): ViaJovemFigure {
    const category = item.category || 'ch';
    
    // CORREÇÃO: Não remover outras categorias, apenas atualizar a categoria específica
    const updatedFigure = { ...currentFigure };
    
    // Aplicar o item na categoria correta
    updatedFigure[category] = {
      id: item.figureId || item.id,
      color: colorId
    };
    
    // IMPORTANTE: Manter todas as outras categorias intactas
    // Não há conflitos - cada categoria é independente
    
    console.log(`✅ [ViaJovemFigureManager] Item aplicado: ${category}-${item.figureId}-${colorId}`);
    console.log(`📊 [ViaJovemFigureManager] Figure atual:`, updatedFigure);
    
    return updatedFigure;
  }

  static getFigureString(figure: ViaJovemFigure): string {
    return Object.entries(figure)
      .filter(([_, data]) => data.id && data.color) // Filtrar entradas vazias
      .map(([type, data]) => `${type}-${data.id}-${data.color}`)
      .join('.');
  }

  // NOVO: Método para validar se uma figura está correta
  static validateFigure(figure: ViaJovemFigure): boolean {
    // Verificar se todas as entradas têm id e color válidos
    return Object.values(figure).every(item => 
      item.id && item.color && 
      !isNaN(parseInt(item.id)) && 
      !isNaN(parseInt(item.color))
    );
  }

  // NOVO: Método para limpar figura (remover entradas inválidas)
  static cleanFigure(figure: ViaJovemFigure): ViaJovemFigure {
    const cleaned: ViaJovemFigure = {};
    
    Object.entries(figure).forEach(([category, data]) => {
      if (data.id && data.color && 
          !isNaN(parseInt(data.id)) && 
          !isNaN(parseInt(data.color))) {
        cleaned[category] = data;
      }
    });
    
    return cleaned;
  }

  // NOVO: Método para remover item de uma categoria específica
  static removeItem(currentFigure: ViaJovemFigure, category: string): ViaJovemFigure {
    const updatedFigure = { ...currentFigure };
    delete updatedFigure[category];
    return updatedFigure;
  }

  // NOVO: Método para obter URL do avatar com figure
  static getAvatarImageUrl(
    figure: ViaJovemFigure, 
    gender: 'M' | 'F' | 'U' = 'M', 
    hotel: string = 'com',
    size: string = 'l',
    direction: string = '2',
    headDirection: string = '3'
  ): string {
    const figureString = this.getFigureString(figure);
    const actualGender = gender === 'U' ? 'M' : gender; // U vira M para preview
    
    const baseUrl = hotel.includes('.') 
      ? `https://www.habbo.${hotel}`
      : `https://www.habbo.com`;
    
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${actualGender}&size=${size}&direction=${direction}&head_direction=${headDirection}&action=std&gesture=std`;
  }
}
