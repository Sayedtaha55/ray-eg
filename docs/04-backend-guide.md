# 4) دليل الواجهة الخلفية الشامل (NestJS Backend)

## 4.1 نقطة الدخول الرئيسية (Main Entry Point)

### 4.1.1 ملف `backend/main.ts`
**المسؤوليات الأساسية:**
```typescript
// تهيئة وتشغيل خادم NestJS
async function bootstrap() {
  // 1. تحميل إعدادات البيئة
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  // 2. إعداد CORS ديناميكي
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. تفعيل Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // 4. تفعيل Trust Proxy للـ load balancers
  app.use(helmet());
  app.set('trust proxy', 1);

  // 5. إعداد Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 100, // حد 100 طلب لكل IP
      message: 'Too many requests from this IP',
    }),
  );

  // 6. تفعيل ValidationPipe عالمي
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 7. إعداد Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 8. تفعيل Static File Serving
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // 9. بدء الخادم
  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  // 10. Graceful Shutdown
  process.on('SIGTERM', () => app.close());
  process.on('SIGINT', () => app.close());
}
```

### 4.1.2 متغيرات البيئة الهامة
```bash
# إعدادات الخادم الأساسية
PORT=4000
NODE_ENV=development
BACKEND_PORT=4000

# الأمان
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-refresh-secret"

# قاعدة البيانات
DATABASE_URL="postgresql://user:pass@localhost:5432/ray_eg"

# CORS و Frontend
CORS_ORIGIN="http://localhost:5174,http://localhost:3000"
FRONTEND_URL="http://localhost:5174"
FRONTEND_APP_URL="http://localhost:5174"

# التشغيل المرن
MINIMAL_BOOT=false
BOOT_MODULES="auth,shop,product,order,payment,courier"

# التخزين
MEDIA_STORAGE_MODE="local"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Redis (اختياري)
REDIS_URL="redis://localhost:6379"

# الخدمات الخارجية
GEMINI_API_KEY="your-gemini-api-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"

# البريد الإلكتروني
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 4.2 تركيب التطبيق (Application Structure)

### 4.2.1 ملف `backend/app.module.ts`
**نظام الموديولات الديناميكي:**
```typescript
@Module({
  imports: [
    // Core Modules (دائماً مشغلة)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    HealthModule,

    // Dynamic Modules (حسب البيئة)
    ...(process.env.MINIMAL_BOOT === 'true' 
      ? [AuthModule] 
      : getDynamicModules()),

    // Shared Modules
    CommonModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

function getDynamicModules() {
  const modules = process.env.BOOT_MODULES?.split(',') || [
    'auth', 'shop', 'product', 'order', 'payment', 'courier', 'analytics'
  ];
  
  const moduleMap = {
    auth: AuthModule,
    shop: ShopModule,
    product: ProductModule,
    order: OrderModule,
    payment: PaymentModule,
    courier: CourierModule,
    analytics: AnalyticsModule,
    notification: NotificationModule,
    feedback: FeedbackModule,
    media: MediaModule,
  };
  
  return modules
    .filter(module => moduleMap[module.trim()])
    .map(module => moduleMap[module.trim()]);
}
```

### 4.2.2 هيكل الموديولات (Module Structure)
**كل موديول يحتوي على:**
```
modules/
├── auth/
│   ├── auth.module.ts          # Module definition
│   ├── auth.controller.ts     # HTTP endpoints
│   ├── auth.service.ts        # Business logic
│   ├── dto/                   # Data Transfer Objects
│   │   ├── signup.dto.ts
│   │   ├── login.dto.ts
│   │   └── reset-password.dto.ts
│   ├── guards/                # Route guards
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/            # Authentication strategies
│   │   ├── jwt.strategy.ts
│   │   └── google.strategy.ts
│   ├── interfaces/            # TypeScript interfaces
│   │   └── auth.interface.ts
│   └── entities/              # Database entities
│       └── user.entity.ts
```

## 4.3 الموديولات الأساسية (Core Modules)

### 4.3.1 موديول المصادقة (Auth Module)

#### الميزات الرئيسية:
```typescript
// Authentication Features
- Email/Password Authentication
- Google OAuth 2.0 Integration
- JWT Token Management
- Refresh Token Rotation
- Password Reset Flow
- Account Verification
- Multi-factor Authentication (MFA)
- Session Management
- Role-based Authorization
- Admin Bootstrap System
```

#### الـ Endpoints الرئيسية:
```typescript
@Controller('auth')
export class AuthController {
  // Registration
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {}

  @Post('courier-signup')
  async courierSignup(@Body() courierSignupDto: CourierSignupDto) {}

  // Authentication
  @Post('login')
  async login(@Body() loginDto: LoginDto) {}

  @Post('logout')
  async logout(@Req() req: Request) {}

  // OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {}

  // Admin Management
  @Post('bootstrap-admin')
  async bootstrapAdmin(@Body() bootstrapDto: BootstrapAdminDto) {}

  // Password Management
  @Post('password/forgot')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {}

  @Post('password/reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {}

  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {}

  // Session Management
  @Get('session')
  @UseGuards(JwtAuthGuard)
  async getSession(@Req() req: Request) {}

  @Post('deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(@Req() req: Request) {}
}
```

#### الـ DTOs الرئيسية:
```typescript
// signup.dto.ts
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  phone: string;

  @IsEnum(['CUSTOMER', 'MERCHANT', 'COURIER'])
  role: UserRole;

  // Legacy fields for compatibility
  @IsOptional()
  @IsString()
  storeType?: string;

  @IsOptional()
  @IsString()
  storePhone?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### 4.3.2 موديول المتاجر (Shop Module)

#### الميزات الرئيسية:
```typescript
// Shop Management Features
- Shop Creation & Customization
- Shop Profile Management
- Category Management
- Shop Analytics
- Shop Settings
- Module Upgrade Requests
- Shop Design Customization
- Shop Image Maps
- Shop Visits Tracking
- Shop Following System
```

#### الـ Endpoints الرئيسية:
```typescript
@Controller('shops')
export class ShopController {
  // Shop Management
  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT', 'ADMIN')
  async createShop(@Req() req: Request, @Body() createShopDto: CreateShopDto) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async getMyShop(@Req() req: Request) {}

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async updateMyShop(@Req() req: Request, @Body() updateShopDto: UpdateShopDto) {}

  // Shop Media
  @Post('me/banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async uploadShopBanner(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {}

  // Module Upgrades
  @Post('me/module-upgrade-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async requestModuleUpgrade(@Req() req: Request, @Body() requestDto: ModuleUpgradeRequestDto) {}

  // Public Shop Access
  @Get('/')
  async getPublicShops(@Query() query: GetShopsDto) {}

  @Get(':slug')
  async getShopBySlug(@Param('slug') slug: string) {}

  @Get(':id')
  async getShopById(@Param('id') id: string) {}

  // Shop Analytics
  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT', 'ADMIN')
  async getShopAnalytics(@Param('id') id: string) {}

  // Shop Interactions
  @Post(':id/visit')
  async visitShop(@Param('id') id: string, @Req() req: Request) {}

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followShop(@Param('id') id: string, @Req() req: Request) {}

  // Admin Management
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAdminShops(@Query() query: AdminGetShopsDto) {}

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateShopStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateShopStatusDto) {}
}
```

### 4.3.3 موديول المنتجات (Product Module)

#### الميزات الرئيسية:
```typescript
// Product Management Features
- Product Creation & Management
- Inventory Tracking
- Product Variants
- Product Categories & Tags
- Product Images & Media
- Product Search & Filtering
- Bulk Operations
- Product Analytics
- Product Reviews & Ratings
- Stock Management
```

#### الـ Endpoints الرئيسية:
```typescript
@Controller('products')
export class ProductController {
  // Public Product Access
  @Get('/')
  async getProducts(@Query() query: GetProductsDto) {}

  @Get(':id')
  async getProductById(@Param('id') id: string) {}

  // Product Management
  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async createProduct(@Req() req: Request, @Body() createProductDto: CreateProductDto) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT', 'ADMIN')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT', 'ADMIN')
  async deleteProduct(@Param('id') id: string) {}

  // Inventory Management
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async updateProductStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {}

  // Shop Product Management
  @Get('manage/by-shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async getShopProducts(@Param('shopId') shopId: string, @Query() query: GetShopProductsDto) {}

  // Bulk Operations
  @Post('manage/by-shop/:shopId/import-drafts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT')
  async importProductDrafts(@Param('shopId') shopId: string, @Body() importDto: ImportProductsDto) {}
}
```

### 4.3.4 موديول الطلبات (Order Module)

#### الميزات الرئيسية:
```typescript
// Order Management Features
- Order Creation & Processing
- Order Status Tracking
- Order Management
- Order Analytics
- Order Returns & Refunds
- Order Notifications
- Order History
- Order Filtering & Search
- Order Export
- Order Automation
```

#### الـ Endpoints الرئيسية:
```typescript
@Controller('orders')
export class OrderController {
  // Order Management
  @Post('/')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Req() req: Request, @Query() query: GetOrdersDto) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Param('id') id: string, @Req() req: Request) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOrder(@Param('id') id: string, @Body() updateOrderDto: OrderUpdateDto) {}

  // Courier Management
  @Patch(':id/assign-courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MERCHANT')
  async assignCourier(@Param('id') id: string, @Body() assignCourierDto: AssignCourierDto) {}

  @Patch(':id/courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async updateCourierStatus(@Param('id') id: string, @Body() updateStatusDto: CourierUpdateDto) {}

  // Order Returns
  @Get(':id/returns')
  @UseGuards(JwtAuthGuard)
  async getOrderReturns(@Param('id') id: string) {}

  @Post(':id/returns')
  @UseGuards(JwtAuthGuard)
  async createOrderReturn(@Param('id') id: string, @Body() returnDto: CreateOrderReturnDto) {}

  // Admin Management
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAdminOrders(@Query() query: AdminGetOrdersDto) {}

  @Get('courier/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async getMyCourierOrders(@Req() req: Request, @Query() query: GetCourierOrdersDto) {}
}
```

### 4.3.5 موديول الدفع (Payment Module)

#### الميزات الرئيسية:
```typescript
// Payment Processing Features
- Payment Gateway Integration
- Payment Processing
- Invoice Generation
- Payment History
- Refund Processing
- Payment Analytics
- Payment Methods Management
- Payment Security
- Payment Notifications
- Payment Reconciliation
```

#### الـ Endpoints الرئيسية:
```typescript
@Controller('payments')
export class PaymentController {
  // Payment Processing
  @Post('process')
  @UseGuards(JwtAuthGuard)
  async processPayment(@Req() req: Request, @Body() paymentDto: ProcessPaymentDto) {}

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Req() req: Request, @Body() verifyDto: VerifyPaymentDto) {}

  // Invoice Management
  @Get('invoices/me')
  @UseGuards(JwtAuthGuard)
  async getMyInvoices(@Req() req: Request, @Query() query: GetInvoicesDto) {}

  @Get('invoices/summary/me')
  @UseGuards(JwtAuthGuard)
  async getMyInvoiceSummary(@Req() req: Request) {}

  @Post('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MERCHANT', 'ADMIN')
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {}

  // Admin Management
  @Get('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAdminInvoices(@Query() query: AdminGetInvoicesDto) {}

  @Get('invoices/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getInvoiceSummary(@Query() query: InvoiceSummaryDto) {}
}
```

### 4.3.6 موديول الكابتنات (Courier Module)

#### الميزات الرئيسية:
```typescript
// Courier Management Features
- Courier Registration
- Courier Status Management
- Order Assignment
- Location Tracking
- Route Optimization
- Courier Analytics
- Courier Performance
- Courier Payments
- Courier Ratings
- Courier Communication
```

#### الـ Endpoints الرئيسية:
```typescript
@Controller('courier')
export class CourierController {
  // Courier Status
  @Get('state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async getCourierState(@Req() req: Request) {}

  @Patch('state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async updateCourierState(@Req() req: Request, @Body() updateStateDto: UpdateCourierStateDto) {}

  // Order Management
  @Get('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async getDeliveryOffers(@Req() req: Request, @Query() query: GetDeliveryOffersDto) {}

  @Post('offers/:id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async acceptDeliveryOffer(@Param('id') id: string, @Req() req: Request) {}

  @Post('offers/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COURIER')
  async rejectDeliveryOffer(@Param('id') id: string, @Req() req: Request, @Body() rejectDto: RejectOfferDto) {}
}
```

## 4.4 الأنماط الأمنية (Security Patterns)

### 4.4.1 Authentication Guards
```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

### 4.4.2 Rate Limiting Configuration
```typescript
// app.module.ts - Rate Limiting Setup
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // حد 100 طلب لكل IP
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Specialized rate limiting for sensitive endpoints
app.use(
  '/api/v1/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 محاولات دخول فقط
    skipSuccessfulRequests: true,
  }),
);

app.use(
  '/api/v1/auth/signup',
  rateLimit({
    windowMs: 60 * 60 * 1000, // ساعة
    max: 3, // 3 تسجيلات فقط في الساعة
  }),
);
```

### 4.4.3 Input Validation
```typescript
// Global ValidationPipe Configuration
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // يزيل الخصائص غير المسموح بها
    forbidNonWhitelisted: true, // يرفض الطلبات بخصائص غير مصرح بها
    transform: true, // يحول الـ payload تلقائياً
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map(error => ({
        field: error.property,
        message: Object.values(error.constraints).join(', '),
      }));
      return new BadRequestException(formattedErrors);
    },
  }),
);
```

### 4.4.4 Error Handling
```typescript
// all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        details = (exceptionResponse as any).details || null;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma errors
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database operation failed';
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: exception instanceof Error ? exception.stack : null 
      }),
    };

    response.status(status).json(errorResponse);
  }
}
```

## 4.5 إدارة قاعدة البيانات (Database Management)

### 4.5.1 Prisma Configuration
```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Custom methods for common operations
  async softDelete(model: string, where: any) {
    return this[model].update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async findWithPagination(model: string, params: any) {
    const { page = 1, limit = 10, ...rest } = params;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this[model].findMany({
        ...rest,
        skip,
        take: limit,
      }),
      this[model].count({ where: rest.where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
```

### 4.5.2 Database Transactions
```typescript
// Transaction example in service
async createOrderWithItems(createOrderDto: CreateOrderDto) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Create order
    const order = await tx.order.create({
      data: {
        userId: createOrderDto.userId,
        shopId: createOrderDto.shopId,
        totalAmount: createOrderDto.totalAmount,
        status: OrderStatus.PENDING,
      },
    });

    // 2. Create order items
    const orderItems = await Promise.all(
      createOrderDto.items.map(item =>
        tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        })
      )
    );

    // 3. Update product stock
    await Promise.all(
      createOrderDto.items.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    return { order, orderItems };
  });
}
```

## 4.6 نظام الإشعارات (Notification System)

### 4.6.1 Notification Service
```typescript
// notification.service.ts
@Injectable()
export class NotificationService {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async sendNotification(notificationDto: SendNotificationDto) {
    const { userId, type, title, message, channels = ['in_app'] } = notificationDto;

    const promises = [];

    // In-app notification
    if (channels.includes('in_app')) {
      promises.push(this.createInAppNotification(userId, type, title, message));
    }

    // Email notification
    if (channels.includes('email')) {
      promises.push(this.emailService.sendEmail(userId, title, message));
    }

    // SMS notification
    if (channels.includes('sms')) {
      promises.push(this.smsService.sendSms(userId, message));
    }

    // Push notification
    if (channels.includes('push')) {
      promises.push(this.pushNotificationService.sendPush(userId, title, message));
    }

    await Promise.allSettled(promises);
  }

  private async createInAppNotification(userId: string, type: string, title: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        isRead: false,
      },
    });
  }
}
```

## 4.7 نظام الملفات والوسائط (Media Management)

### 4.7.1 File Upload Service
```typescript
// media.service.ts
@Injectable()
export class MediaService {
  constructor(
    @Inject('AWS_S3') private readonly s3: S3,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string = 'general') {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    const uploadResult = await this.s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }).promise();

    // Generate thumbnails for images
    if (file.mimetype.startsWith('image/')) {
      await this.generateThumbnails(uploadResult.Location, key);
    }

    return {
      url: uploadResult.Location,
      key,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async generatePresignedUrl(key: string, contentType: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Expires: 60 * 5, // 5 minutes
    });
  }

  private async generateThumbnails(imageUrl: string, key: string) {
    // Implementation for generating thumbnails
    // This would use image processing libraries like Sharp
  }
}
```

## 4.8 نظام التحليلات (Analytics System)

### 4.8.1 Analytics Service
```typescript
// analytics.service.ts
@Injectable()
export class AnalyticsService {
  async getShopAnalytics(shopId: string, period: AnalyticsPeriod) {
    const startDate = this.getStartDate(period);
    const endDate = new Date();

    const [
      totalOrders,
      totalRevenue,
      uniqueVisitors,
      topProducts,
      dailyStats,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          shopId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          shopId,
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.shopVisit.count({
        where: {
          shopId,
          visitedAt: { gte: startDate, lte: endDate },
        },
      }),
      this.getTopProducts(shopId, startDate, endDate),
      this.getDailyStats(shopId, startDate, endDate),
    ]);

    return {
      period,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      uniqueVisitors,
      topProducts,
      dailyStats,
    };
  }

  private async getTopProducts(shopId: string, startDate: Date, endDate: Date) {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          shopId,
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 10,
    });
  }

  private getStartDate(period: AnalyticsPeriod): Date {
    const now = new Date();
    switch (period) {
      case 'TODAY':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'WEEK':
        return new Date(now.setDate(now.getDate() - 7));
      case 'MONTH':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'YEAR':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }
}
```

## 4.9 نظام التخزين المؤقت (Caching System)

### 4.9.1 Redis Cache Service
```typescript
// cache.service.ts
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Cache decorator for methods
  cache(ttl: number = 3600, keyGenerator?: (...args: any[]) => string) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const cacheKey = keyGenerator ? keyGenerator(...args) : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
        
        // Try to get from cache
        const cached = await this.cacheService.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Execute method and cache result
        const result = await method.apply(this, args);
        await this.cacheService.set(cacheKey, result, ttl);
        
        return result;
      };
    };
  }
}
```

## 4.10 أفضل الممارسات (Best Practices)

### 4.10.1 Code Organization
```typescript
// 1. Use DTOs for all input validation
// 2. Use interfaces for type definitions
// 3. Use guards for authentication and authorization
// 4. Use interceptors for cross-cutting concerns
// 5. Use filters for error handling
// 6. Use pipes for data transformation
// 7. Use modules for feature organization
// 8. Use services for business logic
// 9. Use repositories for data access
// 10. Use dependency injection for loose coupling
```

### 4.10.2 Performance Optimization
```typescript
// 1. Use database indexes for frequently queried fields
// 2. Use pagination for large datasets
// 3. Use caching for frequently accessed data
// 4. Use lazy loading for relationships
// 5. Use connection pooling for database connections
// 6. Use compression for API responses
// 7. Use CDN for static assets
// 8. Use background jobs for long-running tasks
// 9. Use queue systems for async processing
// 10. Use monitoring for performance tracking
```

### 4.10.3 Security Best Practices
```typescript
// 1. Always validate and sanitize input
// 2. Use parameterized queries to prevent SQL injection
// 3. Use HTTPS for all communications
// 4. Implement rate limiting for API endpoints
// 5. Use strong password policies
// 6. Implement proper session management
// 7. Use environment variables for sensitive data
// 8. Implement proper error handling without exposing sensitive information
// 9. Use CORS properly to prevent cross-origin attacks
// 10. Regularly update dependencies for security patches
```

## 4.11 نصائح التطوير (Development Tips)

### 4.11.1 Debugging
```typescript
// 1. Use structured logging with Winston
// 2. Use environment-specific logging levels
// 3. Use request tracing for debugging complex flows
// 4. Use database query logging for performance analysis
// 5. Use API documentation with Swagger/OpenAPI
// 6. Use health checks for monitoring
// 7. Use metrics collection for performance tracking
// 8. Use error tracking services like Sentry
// 9. Use proper exception handling
// 10. Use meaningful error messages
```

### 4.11.2 Testing
```typescript
// 1. Write unit tests for all services
// 2. Write integration tests for API endpoints
// 3. Write e2e tests for critical user flows
// 4. Use test databases for testing
// 5. Mock external dependencies
// 6. Use test fixtures for consistent test data
// 7. Test error scenarios
// 8. Test edge cases
// 9. Test performance under load
// 10. Use continuous integration for automated testing
```

### 4.11.3 Deployment
```typescript
// 1. Use environment variables for configuration
// 2. Use Docker for containerization
// 3. Use CI/CD pipelines for automated deployment
// 4. Use health checks for load balancers
// 5. Use graceful shutdown for zero-downtime deployments
// 6. Use database migrations for schema changes
// 7. Use backup strategies for data protection
// 8. Use monitoring for production issues
// 9. Use logging for troubleshooting
// 10. Use scaling strategies for high availability
```
