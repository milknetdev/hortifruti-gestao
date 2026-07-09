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
      // Use Unsplash API (free tier)
      const accessKey = process.env.UNSPLASH_ACCESS_KEY || 'demo';
      
      // If no API key, use placeholder images
      if (accessKey === 'demo') {
        return {
          success: true,
          data: this.getPlaceholderImages(query),
        };
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' food fruit vegetable')}&per_page=6&orientation=squarish`,
        {
          headers: {
            'Authorization': `Client-ID ${accessKey}`,
          },
        }
      );

      if (!response.ok) {
        return {
          success: true,
          data: this.getPlaceholderImages(query),
        };
      }

      const data = await response.json();
      
      const images = data.results?.map((photo: any) => ({
        url: photo.urls.regular,
        thumb: photo.urls.small,
        alt: photo.alt_description || query,
        author: photo.user?.name,
        authorUrl: photo.user?.links?.html,
      })) || [];

      return {
        success: true,
        data: images.length > 0 ? images : this.getPlaceholderImages(query),
      };
    } catch (error) {
      return {
        success: true,
        data: this.getPlaceholderImages(query),
      };
    }
  }

  private getPlaceholderImages(query: string) {
    // Generate placeholder images using picsum.photos
    const seed = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      {
        url: `https://picsum.photos/seed/${seed}1/400/400`,
        thumb: `https://picsum.photos/seed/${seed}1/200/200`,
        alt: query,
        author: 'Placeholder',
      },
      {
        url: `https://picsum.photos/seed/${seed}2/400/400`,
        thumb: `https://picsum.photos/seed/${seed}2/200/200`,
        alt: query,
        author: 'Placeholder',
      },
      {
        url: `https://picsum.photos/seed/${seed}3/400/400`,
        thumb: `https://picsum.photos/seed/${seed}3/200/200`,
        alt: query,
        author: 'Placeholder',
      },
    ];
  }
}
