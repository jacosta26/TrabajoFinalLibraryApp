import { Routes } from '@angular/router';
import { CategoriaComponent } from './pages/categoria/categoria.component';
import { CategoriaEditComponent } from './pages/categoria/categoria-edit/categoria-edit.component';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { ClienteEditComponent } from './pages/cliente/cliente-edit/cliente-edit.component';
import { LibroComponent } from './pages/libro/libro.component';

export const routes: Routes = [
    {path: 'pages/categoria', component: CategoriaComponent, children:[
        {path: 'new', component: CategoriaEditComponent},
        {path: 'edit/:id', component: CategoriaEditComponent}
    ]},
    {path: 'pages/cliente', component: ClienteComponent, children:[
        {path: 'new', component: ClienteEditComponent},
        {path: 'edit/:id', component: ClienteEditComponent}
    ]},
    {path: 'pages/libro', component: LibroComponent},
    {path: 'pages/search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)},
    {path: 'pages/reserva-wizard-ai', loadComponent: () => import('./pages/reserva-wizard/reserva-wizard-ai.component').then(m => m.ReservaWizardAiComponent)}
];
