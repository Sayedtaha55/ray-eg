import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { ProductService } from './product.service';

@Controller('api/v1/products')
export class ProductController {
  constructor(@Inject(ProductService) private readonly productService: ProductService) {}

  @Get()
  async list(@Query('shopId') shopId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const sid = typeof shopId === 'string' ? String(shopId).trim() : '';
    const pageNum = typeof page === 'string' && page.trim() ? Number(page) : undefined;
    const limitNum = typeof limit === 'string' && limit.trim() ? Number(limit) : undefined;
    const paging = {
      page: typeof pageNum === 'number' && Number.isFinite(pageNum) ? pageNum : undefined,
      limit: typeof limitNum === 'number' && Number.isFinite(limitNum) ? limitNum : undefined,
    };
    if (sid) {
      return this.productService.listByShop(sid, paging);
    }
    return this.productService.listAllActive(paging);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.productService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async create(@Body() body: any, @Request() req) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromBody = typeof body?.shopId === 'string' ? body.shopId : undefined;
    const targetShopId = role === 'ADMIN' ? shopIdFromBody : shopIdFromToken;

    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    if (role !== 'ADMIN' && shopIdFromToken !== targetShopId) {
      throw new ForbiddenException('ليس لديك صلاحية لإضافة منتجات لهذا المتجر');
    }

    const name = String(body?.name || '').trim();
    const price = Number(body?.price);
    const stock = typeof body?.stock === 'number' ? body.stock : Number(body?.stock);
    const category = typeof body?.category === 'string' ? body.category : 'عام';
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl : null;
    const description = typeof body?.description === 'string' ? body.description : null;

    if (!name) throw new BadRequestException('name مطلوب');
    if (Number.isNaN(price) || price < 0) throw new BadRequestException('price غير صحيح');

    return this.productService.create({
      shopId: targetShopId,
      name,
      price,
      stock: Number.isNaN(stock) || stock < 0 ? 0 : stock,
      category,
      imageUrl,
      description,
    });
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateStock(@Param('id') id: string, @Body() body: any, @Request() req) {
    const stock = Number(body?.stock);
    return this.productService.updateStock(id, stock, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async delete(@Param('id') id: string, @Request() req) {
    return this.productService.delete(id, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
