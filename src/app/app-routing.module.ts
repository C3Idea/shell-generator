import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { SandboxComponent } from './sandbox/sandbox.component';

const routes: Routes = [
  {
    path: "",
    component: SandboxComponent
  },
  {
    path: "game",
    component: GameComponent
  }
  ,
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
