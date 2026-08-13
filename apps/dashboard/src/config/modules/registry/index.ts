import { coreModule } from './core';
import { salesModule } from './sales';
import { posModule } from './pos';
import { inventoryModule } from './inventory';
import { financeModule } from './finance';
import { crmModule } from './crm';
import { marketingModule } from './marketing';
import { bookingsModule } from './bookings';
import { hrModule } from './hr';
import { analyticsModule } from './analytics';
import { aiModule } from './ai';

export const MODULE_REGISTRY = [
  coreModule,
  salesModule,
  posModule,
  inventoryModule,
  financeModule,
  crmModule,
  marketingModule,
  bookingsModule,
  hrModule,
  analyticsModule,
  aiModule,
];
