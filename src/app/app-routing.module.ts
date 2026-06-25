import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './constants/Roles';
import { HabitacionesComponent } from './components/habitaciones/habitaciones.component';
import { HuespedesComponent } from './components/huespedes/huespedes.component';

const routes: Routes = [
  {path: '',redirectTo:'login',pathMatch:'full'},
  {path: 'login',component:LoginComponent},
  {path: 'dashboard',component: DashboardComponent,canActivate: [AuthGuard], children: [
    {path: 'usuarios',component: UsuariosComponent,canActivate: [AuthGuard],data:{roles: [Roles.ADMIN]}},
    {path: 'habitaciones',component: HabitacionesComponent,canActivate: [AuthGuard]},
    {path: 'huespedes',component: HuespedesComponent,canActivate: [AuthGuard]}
  ] },{ path: '**',redirectTo:'dashboard'}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
