import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  
  @Get('search')
  @ApiOperation({ summary: 'Buscar imagens para produtos' })
  async searchImages(@Query('query') query: string) {
    if (!query) {
      return { success: false, message: 'Query é obrigatória' };
    }

    try {
      // Use Unsplash source for direct image URLs based on search
      // This doesn't require an API key and returns relevant food images
      const searchTerms = query.toLowerCase().trim();
      
      // Food-specific search terms for better results
      const foodCategories: Record<string, string> = {
        'banana': 'banana,fruit,yellow',
        'maçã': 'apple,fruit,red',
        'maca': 'apple,fruit,red',
        'laranja': 'orange,fruit,citrus',
        'limão': 'lemon,fruit,citrus',
        'limao': 'lemon,fruit,citrus',
        'abacaxi': 'pineapple,fruit,tropical',
        'uva': 'grape,fruit,purple',
        'morango': 'strawberry,fruit,red',
        'melancia': 'watermelon,fruit,summer',
        'mamão': 'papaya,fruit,tropical',
        'mamao': 'papaya,fruit,tropical',
        'pera': 'pear,fruit,green',
        'pêssego': 'peach,fruit',
        'pessego': 'peach,fruit',
        'kiwi': 'kiwi,fruit,green',
        'manga': 'mango,fruit,tropical',
        'abacate': 'avocado,fruit,green',
        'coco': 'coconut,fruit,tropical',
        'cebola': 'onion,vegetable',
        'tomate': 'tomato,vegetable,red',
        'alface': 'lettuce,vegetable,salad',
        'cenoura': 'carrot,vegetable,orange',
        'batata': 'potato,vegetable',
        'beterraba': 'beetroot,vegetable,purple',
        'abobrinha': 'zucchini,vegetable,green',
        'abóbora': 'pumpkin,vegetable,orange',
        'abobora': 'pumpkin,vegetable,orange',
        'pepino': 'cucumber,vegetable,green',
        'pimentão': 'pepper,vegetable,colorful',
        'pimentao': 'pepper,vegetable,colorful',
        'brócolis': 'broccoli,vegetable,green',
        'brocolis': 'broccoli,vegetable,green',
        'couve': 'kale,vegetable,green',
        'espinafre': 'spinach,vegetable,green',
        'alho': 'garlic,vegetable',
        'gengibre': 'ginger,root,spice',
        'chuchu': 'chayote,vegetable',
        'berinjela': 'eggplant,vegetable,purple',
        'milho': 'corn,vegetable,yellow',
        'ervilha': 'peas,vegetable,green',
        'feijão': 'beans,legume',
        'feijao': 'beans,legume',
        'arroz': 'rice,grain',
        'batata doce': 'sweet potato,vegetable',
        'mandioca': 'cassava,root',
        'couve-flor': 'cauliflower,vegetable',
        'salsinha': 'parsley,herb,fresh',
        'cebolinha': 'green onion,herb',
        'coentro': 'cilantro,herb,fresh',
        'hortelã': 'mint,herb,fresh',
        'hortela': 'mint,herb,fresh',
        'manjericão': 'basil,herb,fresh',
        'manjericao': 'basil,herb,fresh',
        'alecrim': 'rosemary,herb',
        'tomilho': 'thyme,herb',
        'sálvia': 'sage,herb',
        'salvia': 'sage,herb',
      };

      // Find matching category or use generic search
      let searchTerm = searchTerms;
      for (const [key, value] of Object.entries(foodCategories)) {
        if (searchTerms.includes(key)) {
          searchTerm = value;
          break;
        }
      }

      // Generate multiple relevant images using Unsplash source
      // Each URL will redirect to a different relevant image
      const images = [];
      const variations = [
        `${searchTerm} food fresh organic`,
        `${searchTerm} vegetable fruit`,
        `${searchTerm} healthy natural`,
      ];

      for (let i = 0; i < 6; i++) {
        const variation = variations[i % variations.length];
        const seed = `${searchTerm}-${i}-${Date.now()}`;
        images.push({
          url: `https://source.unsplash.com/400x400/?${encodeURIComponent(variation)}&sig=${seed}`,
          thumb: `https://source.unsplash.com/200x200/?${encodeURIComponent(variation)}&sig=${seed}`,
          alt: `${query} - Imagem ${i + 1}`,
          author: 'Unsplash',
        });
      }

      return {
        success: true,
        data: images,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar imagens',
      };
    }
  }
}
