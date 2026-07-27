import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AiBuilderService } from './ai-builder.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('ai/builder')
@UseGuards(JwtAuthGuard)
export class AiBuilderController {
  private readonly logger = new Logger(AiBuilderController.name);

  constructor(private readonly builderService: AiBuilderService) {}

  private verifyShopAccess(req: any, shopId: string) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }
  }

  // ─── Generate Complete Theme (colors + brand + page schema) ──

  @Post('generate-theme')
  @HttpCode(HttpStatus.OK)
  async generateTheme(
    @Req() req: any,
    @Body()
    body: {
      shopId: string;
      activityId: string;
      shopName: string;
      shopDescription?: string;
      stylePreset?: string;
      locale?: string;
    },
  ) {
    if (!body.activityId) throw new BadRequestException('activityId is required');
    if (!body.shopName) throw new BadRequestException('shopName is required');
    this.verifyShopAccess(req, body.shopId);

    return this.builderService.generateTheme({
      shopId: body.shopId,
      activityId: body.activityId,
      shopName: body.shopName,
      shopDescription: body.shopDescription,
      stylePreset: body.stylePreset as any,
      locale: body.locale || 'ar',
    });
  }

  // ─── Generate Pages for an Activity ──────────────────────────

  @Post('generate-pages')
  @HttpCode(HttpStatus.OK)
  async generatePages(
    @Req() req: any,
    @Body()
    body: {
      shopId: string;
      activityId: string;
      shopName: string;
      shopDescription?: string;
      locale?: string;
      pages?: string[];
    },
  ) {
    if (!body.activityId) throw new BadRequestException('activityId is required');
    this.verifyShopAccess(req, body.shopId);

    return this.builderService.generatePages({
      shopId: body.shopId,
      activityId: body.activityId,
      shopName: body.shopName,
      shopDescription: body.shopDescription,
      locale: body.locale || 'ar',
      pages: body.pages,
    });
  }

  // ─── Generate Brand Identity ─────────────────────────────────

  @Post('generate-brand')
  @HttpCode(HttpStatus.OK)
  async generateBrand(
    @Req() req: any,
    @Body()
    body: {
      shopId: string;
      activityId: string;
      shopName: string;
      shopDescription?: string;
      locale?: string;
    },
  ) {
    if (!body.activityId) throw new BadRequestException('activityId is required');
    if (!body.shopName) throw new BadRequestException('shopName is required');
    this.verifyShopAccess(req, body.shopId);

    return this.builderService.generateBrand({
      shopId: body.shopId,
      activityId: body.activityId,
      shopName: body.shopName,
      shopDescription: body.shopDescription,
      locale: body.locale || 'ar',
    });
  }

  // ─── Chat-based Builder (iterative design changes) ───────────

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Req() req: any,
    @Body()
    body: {
      shopId: string;
      message: string;
      context?: {
        currentPage?: string;
        locale?: string;
        activityId?: string;
        selectedSectionId?: string;
      };
    },
  ) {
    if (!body.message?.trim()) throw new BadRequestException('message is required');
    if (!body.shopId) throw new BadRequestException('shopId is required');
    this.verifyShopAccess(req, body.shopId);

    return this.builderService.chat({
      shopId: body.shopId,
      message: body.message.trim(),
      context: body.context,
    });
  }

  // ─── Visual Editor: Element-specific AI changes ──────────────

  @Post('visual-edit')
  @HttpCode(HttpStatus.OK)
  async visualEdit(
    @Req() req: any,
    @Body()
    body: {
      shopId: string;
      componentName: string;
      elementInspection: any;
      userPrompt: string;
      locale?: string;
    },
  ) {
    if (!body.shopId) throw new BadRequestException('shopId is required');
    if (!body.componentName) throw new BadRequestException('componentName is required');
    if (!body.userPrompt?.trim()) throw new BadRequestException('userPrompt is required');
    this.verifyShopAccess(req, body.shopId);

    return this.builderService.visualEdit({
      shopId: body.shopId,
      componentName: body.componentName,
      elementInspection: body.elementInspection,
      userPrompt: body.userPrompt.trim(),
      locale: body.locale || 'ar',
    });
  }
}
