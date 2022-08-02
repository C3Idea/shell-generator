import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurfaceComponent } from './surface/surface.component';

const routes: Routes = [
  {
    path: "",
    component: SurfaceComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
