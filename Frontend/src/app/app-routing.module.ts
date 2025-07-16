import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UserProfileComponent } from './modules/user-profile/user-profile.component';
import { WelcomeComponent } from './modules/welcome/welcome.component';
import { AuthGuard } from './shared/services/auth.guard';
// import { start } from 'repl';
import { StartPageComponent } from './modules/start-page/start-page.component';
import { ChatBot } from './shared/components/partials/chatbot/chatbot.component';
import { DiagramPageComponent } from './modules/diagram-page/diagram-page.component';
import { ShowTopicComponent } from './modules/show-topic/show-topic.component';
import { NotAuthGuard } from './shared/services/not-auth.guard';
import { NotFoundComponent } from './modules/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: WelcomeComponent,
  },
  {
    path: '',
    component: StartPageComponent,
    canActivate : [NotAuthGuard]
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: 'diagram',
    canActivate: [AuthGuard],
    component: DiagramPageComponent,
  },
  {
    path: 'show-topic/journey/:jid/course/:cid/topic/:id',
    canActivate: [AuthGuard],
    component: ShowTopicComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'user-profile',
    canActivate: [AuthGuard],
    component: UserProfileComponent,
  },
  {
    path: 'chatbot',
    component: ChatBot,
  },
  { path: '**',
   component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // this makes the page scroll to top after navigation
    scrollPositionRestoration : 'enabled'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
