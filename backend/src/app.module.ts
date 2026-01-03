import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './user/user.module';

// Infrastructure Modules
import { AttachmentModule } from './attachment/attachment.module';
import { BranchModule } from './branch/branch.module';
import { WarehouseModule } from './warehouse/warehouse.module';

// Product Management Modules
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';

import { ProductModule } from './product/product.module';
import { TagModule } from './tag/tag.module';
import { UnitModule } from './unit/unit.module';

// Inventory & Supply Chain Modules
import { InventoryModule } from './inventory/inventory.module';
import { ProductionModule } from './production/production.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { SupplierModule } from './supplier/supplier.module';

// Financial Modules
import { AccountModule } from './account/account.module';
import { PaymentModule } from './payment/payment.module';

// Customer & Sales Modules
import { CashRegisterModule } from './cash-register/cash-register.module';
import { CustomerGroupModule } from './customer-group/customer-group.module';
import { CustomerModule } from './customer/customer.module';
import { PosModule } from './pos/pos.module';

import { QuotationModule } from './quotation/quotation.module';
import { SalesModule } from './sales/sales.module';

// Human Resource Management Module
import { HrmModule } from './hrm/hrm.module';

// Backup Module
import { BackupModule } from './backup/backup.module';

// Reports Module
import { ReportModule } from './reports/reports.module';

// Audit & Configuration Modules
import { AuditInterceptor, AuditModule } from 'src/audit/audit.module';
import { SettingsModule } from './settings/settings.module';

// Guards & Interceptors

import { ExpenseCategoryModule } from './expense-category/expense-category.module';
import { ExpenseModule } from './expense/expense.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // Core
    AuthModule,
    UserModule,
    RbacModule,
    RolesModule,

    // Infrastructure
    AttachmentModule,

    BranchModule,
    WarehouseModule,

    // Product Management
    ProductModule,
    BrandModule,
    CategoryModule,

    TagModule,
    UnitModule,

    // Inventory & Supply Chain
    InventoryModule,
    ProductionModule,
    SupplierModule,
    PurchaseOrderModule,

    // Financial
    AccountModule,
    PaymentModule,

    // Customer & Sales
    CustomerGroupModule,
    CustomerModule,
    SalesModule,
    QuotationModule,
    PosModule,
    CashRegisterModule,
    ExpenseModule,
    ExpenseCategoryModule,

    // Human Resource Management
    HrmModule,

    // Backup
    BackupModule,

    // Reports
    ReportModule,

    // Audit & Configuration
    AuditModule,
    SettingsModule,
    InvoiceModule,
  ],

  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
