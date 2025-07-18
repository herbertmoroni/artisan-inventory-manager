import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ImportListComponent } from './pages/import-list/import-list.component';
import { SalesComponent } from './pages/sales/sales.component';
import { ItemFormComponent } from './components/item-form/item-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'item-form', component: ItemFormComponent },       
  { path: 'item-form/:id', component: ItemFormComponent },    
  { path: 'import', component: ImportListComponent },
  { path: 'sales', component: SalesComponent },
  { path: '**', redirectTo: '/dashboard' }
];