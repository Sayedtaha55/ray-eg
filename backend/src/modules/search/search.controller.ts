import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SearchService } from '@modules/search/search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(
    @Query('q') query: string,
    @Query('shopId') shopId?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    if (!query) {
      throw new HttpException('Query parameter "q" is required', HttpStatus.BAD_REQUEST);
    }

    const filters: any = {};
    if (shopId) filters.shopId = shopId;
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    return await this.searchService.searchProducts(query, filters);
  }

  @Get('shops')
  async searchShops(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('governorate') governorate?: string,
    @Query('city') city?: string,
  ) {
    if (!query) {
      throw new HttpException('Query parameter "q" is required', HttpStatus.BAD_REQUEST);
    }

    const filters: any = {};
    if (category) filters.category = category;
    if (governorate) filters.governorate = governorate;
    if (city) filters.city = city;

    return await this.searchService.searchShops(query, filters);
  }

  @Get('health')
  async health() {
    try {
      await this.searchService['client'].ping();
      return { status: 'ok', message: 'Elasticsearch is available' };
    } catch (error) {
      throw new HttpException(
        { status: 'error', message: 'Elasticsearch is not available' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
