import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app.routes';
import { InventoryService } from './services/inventory.service';
import { FairService } from './services/fair.service';
import { AuthService } from './services/auth.service';
import { ImageService } from './services/image.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    importProvidersFrom(
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule
    ),
    InventoryService,
    FairService,
    AuthService,
    ImageService
  ]
};