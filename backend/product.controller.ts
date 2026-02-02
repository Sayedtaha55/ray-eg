import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { ProductService } from './product.service';

@Controller('api/v1/products')
export class ProductController {
  constructor(@Inject(ProductService) private readonly productService: ProductService) {}

  private toLatinDigits(input: string) {
    const map: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    };
    return String(input || '').replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
  }

  private parseNumberInput(value: any) {
    if (typeof value === 'number') return value;
    const raw = typeof value === 'string' ? value : String(value ?? '');
    const cleaned = this.toLatinDigits(raw)
      .trim()
      .replace(/[٬،]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/\s+/g, '');
    if (!cleaned) return NaN;
    return Number(cleaned);
  }

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

  @Get('manage/by-shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listForManage(
    @Param('shopId') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const sid = typeof shopId === 'string' ? String(shopId).trim() : '';
    const pageNum = typeof page === 'string' && page.trim() ? Number(page) : undefined;
    const limitNum = typeof limit === 'string' && limit.trim() ? Number(limit) : undefined;
    const paging = {
      page: typeof pageNum === 'number' && Number.isFinite(pageNum) ? pageNum : undefined,
      limit: typeof limitNum === 'number' && Number.isFinite(limitNum) ? limitNum : undefined,
    };
    return this.productService.listByShopForManage(sid, paging, { role: req.user?.role, shopId: req.user?.shopId });
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
    const price = this.parseNumberInput(body?.price);
    const stock = this.parseNumberInput(body?.stock);
    const category = typeof body?.category === 'string' ? body.category : 'عام';
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl : null;
    const description = typeof body?.description === 'string' ? body.description : null;

    const trackStock = typeof body?.trackStock === 'boolean' ? body.trackStock : undefined;
    const images = typeof body?.images === 'undefined' ? undefined : body.images;
    const colors = typeof body?.colors === 'undefined' ? undefined : body.colors;
    const sizes = typeof body?.sizes === 'undefined' ? undefined : body.sizes;
    const addons = typeof body?.addons === 'undefined' ? undefined : body.addons;
    const menuVariants = typeof body?.menuVariants === 'undefined'
      ? (typeof body?.menu_variants === 'undefined' ? undefined : body.menu_variants)
      : body.menuVariants;

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
      trackStock,
      images,
      colors,
      sizes,
      addons,
      menuVariants,
    });
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateStock(@Param('id') id: string, @Body() body: any, @Request() req) {
    const stock = Number(body?.stock);
    return this.productService.updateStock(id, stock, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;

    // Validate basic fields
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const price = typeof body?.price === 'undefined' ? undefined : this.parseNumberInput(body?.price);
    const stock = typeof body?.stock === 'undefined' ? undefined : this.parseNumberInput(body?.stock);
    const category = typeof body?.category === 'string' ? body.category : undefined;
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl : undefined;
    const description = typeof body?.description === 'string' ? body.description : undefined;

    const trackStock = typeof body?.trackStock === 'boolean' ? body.trackStock : undefined;
    const images = typeof body?.images === 'undefined' ? undefined : body.images;
    const colors = typeof body?.colors === 'undefined' ? undefined : body.colors;
    const sizes = typeof body?.sizes === 'undefined' ? undefined : body.sizes;
    const addons = typeof body?.addons === 'undefined' ? undefined : body.addons;
    const menuVariants = typeof body?.menuVariants === 'undefined'
      ? (typeof body?.menu_variants === 'undefined' ? undefined : body.menu_variants)
      : body.menuVariants;

    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : undefined;

    if (name !== undefined && !name) throw new BadRequestException('name لا يمكن أن يكون فارغاً');
    if (price !== undefined && (Number.isNaN(price) || price < 0)) throw new BadRequestException('price غير صحيح');
    if (stock !== undefined && (Number.isNaN(stock) || stock < 0)) throw new BadRequestException('stock غير صحيح');

    return this.productService.update(id, {
      name,
      price,
      stock,
      category,
      imageUrl,
      description,
      trackStock,
      images,
      colors,
      sizes,
      addons,
      menuVariants,
      isActive,
    }, { role, shopId: shopIdFromToken });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async delete(@Param('id') id: string, @Request() req) {
    return this.productService.delete(id, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
