import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { GridComponent } from './shared/components/grid/grid.component';
import { PanelComponent } from './shared/components/panel/panel.component';
import { TopKListComponent } from './shared/components/explanations/top-k-list/top-k-list.component';
import { GraphComponent } from './shared/components/explanations/graph/graph.component';
import { EntityRadarChartComponent } from './shared/components/explanations/entity-radar-chart/entity-radar-chart.component';
import { TopicVennDiagramComponent } from './shared/components/explanations/topic-venn-diagram/topic-venn-diagram.component';
import { PanelSystemComponent } from './shared/components/panel-system/panel-system.component';
import { PanelBodyComponent } from './shared/components/panel/components/panel-body/panel-body.component';
import { PanelHeaderComponent } from './shared/components/panel/components/panel-header/panel-header.component';
import { PageTopBarComponent } from './shared/components/partials/page-top-bar/page-top-bar.component';
import { UserProfileComponent } from './modules/user-profile/user-profile.component';
import { AppTopBarComponent } from './shared/components/partials/app-top-bar/app-top-bar.component';
import { UserProfileFormComponent } from './shared/components/forms/user-profile-form/user-profile-form.component';
import { StarRatingComponent } from './shared/components/partials/star-rating/star-rating.component';
import { ChipsAutocompleteComponent } from './shared/components/partials/chips-autocomplete/chips-autocomplete.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { RegisterFormComponent } from './shared/components/forms/register-form/register-form.component';
import { LoginFormComponent } from './shared/components/forms/login-form/login-form.component';
import { HttpClientModule } from '@angular/common/http';
import { SnackbarComponent } from './shared/components/partials/snackbar/snackbar.component';
import { AppLoaderComponent } from './shared/components/partials/app-loader/app-loader.component';
import { RecommendationSelectorComponent } from './shared/components/partials/recommendation-selector/recommendation-selector.component';
import { GraphLegendComponent } from './shared/components/partials/graph/graph-legend/graph-legend.component';
import { GraphActionBarComponent } from './shared/components/partials/graph/graph-action-bar/graph-action-bar.component';
import { TopKListItemComponent } from './shared/components/explanations/top-k-list/components/top-k-list-item/top-k-list-item.component';
import { InfoBoxComponent } from './shared/components/explanations/info-box/info-box.component';
import { PillComponent } from './shared/components/partials/pill/pill.component';
import { WelcomeComponent } from './modules/welcome/welcome.component';
import { JourneySelectionComponent } from './modules/welcome/components/journey-selection/journey-selection.component';
import { JourneyIndustrySelectionComponent } from './modules/welcome/components/journey-industry-selection/journey-industry-selection.component';
import { WelcomeActionSelectionComponent } from './modules/welcome/components/welcome-action-selection/welcome-action-selection.component';
import { IndustryCardComponent } from './shared/components/cards/industry-card/industry-card.component';
import { JourneyCardComponent } from './shared/components/cards/journey-card/journey-card.component';
import { JourneyHistoryCardComponent } from './shared/components/cards/journey-history-card/journey-history-card.component';
import { ExplorationDialogComponent } from './shared/components/dialogs/exploration-dialog/exploration-dialog.component';
import { ExplorationRecommendationComponent } from './shared/components/partials/exploration/exploration-recommendation/exploration-recommendation.component';
import { ExplorationCourseComponent } from './shared/components/partials/exploration/exploration-course/exploration-course.component';
import { ExplorationTopicComponent } from './shared/components/partials/exploration/exploration-topic/exploration-topic.component';
import { ExplorationEducationalPackageComponent } from './shared/components/partials/exploration/exploration-educational-package/exploration-educational-package.component';
import { ExplorationOerComponent } from './shared/components/partials/exploration/exploration-oer/exploration-oer.component';
import { ExplorationBreadcrumbComponent } from './shared/components/partials/exploration/exploration-breadcrumb/exploration-breadcrumb.component';
import { TabMenuComponent } from './shared/components/partials/tab-menu/tab-menu.component';
import { ExplorationInformationRecommendationComponent } from './shared/components/partials/exploration/partials/exploration-information/exploration-information-recommendation/exploration-information-recommendation.component';
import { ExplorationCoursesComponent } from './shared/components/partials/exploration/partials/exploration-courses/exploration-courses.component';
import { CourseCardComponent } from './shared/components/cards/course-card/course-card.component';
import { ExplorationTopicsComponent } from './shared/components/partials/exploration/partials/exploration-topics/exploration-topics.component';
import { TopicCardComponent } from './shared/components/cards/topic-card/topic-card.component';
import { ExplorationEducationalPackagesComponent } from './shared/components/partials/exploration/partials/exploration-educational-packages/exploration-educational-packages.component';
import { EducationalPackageCardComponent } from './shared/components/cards/educational-package-card/educational-package-card.component';
import { ExplorationOersComponent } from './shared/components/partials/exploration/partials/exploration-oers/exploration-oers.component';
import { OerCardComponent } from './shared/components/cards/oer-card/oer-card.component';
import { ExploreMoreJourniesComponent } from './shared/components/partials/exploration/partials/exploration-more/explore-more-journies/explore-more-journies.component';
import { LoadingComponent } from './shared/components/partials/loading/loading.component';
import { ExploreJourneyCardComponent } from './shared/components/cards/exploration/explore-journey-card/explore-journey-card.component';
import { ExplorationInformationCourseComponent } from './shared/components/partials/exploration/partials/exploration-information/exploration-information-course/exploration-information-course.component';
import { ExploreMoreCoursesComponent } from './shared/components/partials/exploration/partials/exploration-more/explore-more-courses/explore-more-courses.component';
import { ExploreCourseCardComponent } from './shared/components/cards/exploration/explore-course-card/explore-course-card.component';
import { ExplorationInformationTopicComponent } from './shared/components/partials/exploration/partials/exploration-information/exploration-information-topic/exploration-information-topic.component';
import { ExploreMoreEducationalPackagesComponent } from './shared/components/partials/exploration/partials/exploration-more/explore-more-educational-packages/explore-more-educational-packages.component';
import { ExploreMoreTopicsComponent } from './shared/components/partials/exploration/partials/exploration-more/explore-more-topics/explore-more-topics.component';
import { ExploreTopicCardComponent } from './shared/components/cards/exploration/explore-topic-card/explore-topic-card.component';
import { ExplorationInformationEducationalPackageComponent } from './shared/components/partials/exploration/partials/exploration-information/exploration-information-educational-package/exploration-information-educational-package.component';
import { ExploreEducationalPackageCardComponent } from './shared/components/cards/exploration/explore-educational-package-card/explore-educational-package-card.component';
import { ExplorationInformationOerComponent } from './shared/components/partials/exploration/partials/exploration-information/exploration-information-oer/exploration-information-oer.component';
import { RadarChartLegendComponent } from './shared/components/partials/radar-chart/radar-chart-legend/radar-chart-legend.component';
import { TreeDiagramComponent } from './shared/components/explanations/tree-diagram/tree-diagram.component';
import { MatTreeModule } from '@angular/material/tree';
import { NodeGroupLabelComponent } from './shared/components/partials/node-group-label/node-group-label.component';
import { ChatBot } from './shared/components/partials/chatbot/chatbot.component';
import { ChatbotMainMenu } from './shared/components/partials/chatbot/chatbot-main-menu/chatbot-main-menu.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatbotWelcomeMenu } from './shared/components/partials/chatbot/chatbot-welcome-menu/chatbot-welcome-menu.component';
import { MatRippleModule } from '@angular/material/core';
import { ChatbotSessionsMenu } from './shared/components/partials/chatbot/chatbot-sessions-menu/chatbot-sessions-menu.component';
import { MatListModule } from '@angular/material/list';
import { ChatbotChattingMenu } from './shared/components/partials/chatbot/chatbot-chatting-menu/chatbot-chatting-menu.component';
import { ChatbotStartMenu } from './shared/components/partials/chatbot/chatbot-start-menu/chatbot-start-menu.component';
import { ChatbotRequestsMenu } from './shared/components/partials/chatbot/chatbot-requests-menu/chatbot-requests-menu.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageViewer } from './shared/components/partials/image-viewer/image-viewer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatbotNotificationMenu } from './shared/components/partials/chatbot/chatbot-notification-menu/chatbot-notification-menu.component';
import { emptyComponent } from './shared/components/partials/empty/empty.component';
import { environment } from 'src/environments/environment';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ChatbotSpeechMenu } from './shared/components/partials/chatbot/chatbot-speech-menu/chatbot-speech-menu.component';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { StartPageComponent } from './modules/start-page/start-page.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { FooterComponent } from './shared/components/partials/footer/footer.component';


import { DiagramPageComponent } from './modules/diagram-page/diagram-page.component';
import { ShowTopicComponent } from './modules/show-topic/show-topic.component';
import { SafePipe } from './shared/pipes/safepipe.pipe';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { MatSidenavModule } from '@angular/material/sidenav';
import { OerViewComponent } from './shared/components/oer-view/oer-view.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
const config: SocketIoConfig = {
  url: environment.socketUrl, // socket server url;
  options: {}
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GridComponent,
    PanelComponent,
    TopKListComponent,
    GraphComponent,
    EntityRadarChartComponent,
    TopicVennDiagramComponent,
    PanelSystemComponent,
    PanelBodyComponent,
    PanelHeaderComponent,
    PageTopBarComponent,
    UserProfileComponent,
    AppTopBarComponent,
    UserProfileFormComponent,
    StarRatingComponent,
    ChipsAutocompleteComponent,
    LoginComponent,
    RegisterComponent,
    RegisterFormComponent,
    LoginFormComponent,
    SnackbarComponent,
    AppLoaderComponent,
    RecommendationSelectorComponent,
    GraphLegendComponent,
    GraphActionBarComponent,
    TopKListItemComponent,
    InfoBoxComponent,
    PillComponent,
    WelcomeComponent,
    JourneySelectionComponent,
    JourneyIndustrySelectionComponent,
    WelcomeActionSelectionComponent,
    IndustryCardComponent,
    JourneyCardComponent,
    JourneyHistoryCardComponent,
    ExplorationDialogComponent,
    ExplorationRecommendationComponent,
    ExplorationCourseComponent,
    ExplorationTopicComponent,
    ExplorationEducationalPackageComponent,
    ExplorationOerComponent,
    ExplorationBreadcrumbComponent,
    TabMenuComponent,
    ExplorationInformationRecommendationComponent,
    ExplorationCoursesComponent,
    CourseCardComponent,
    ExplorationTopicsComponent,
    TopicCardComponent,
    ExplorationEducationalPackagesComponent,
    EducationalPackageCardComponent,
    ExplorationOersComponent,
    OerCardComponent,
    ExploreMoreJourniesComponent,
    LoadingComponent,
    ExploreJourneyCardComponent,
    ExplorationInformationCourseComponent,
    ExploreMoreCoursesComponent,
    ExploreCourseCardComponent,
    ExplorationInformationTopicComponent,
    ExploreMoreEducationalPackagesComponent,
    ExploreMoreTopicsComponent,
    ExploreTopicCardComponent,
    ExplorationInformationEducationalPackageComponent,
    ExploreEducationalPackageCardComponent,
    ExplorationInformationOerComponent,
    RadarChartLegendComponent,
    TreeDiagramComponent,
    NodeGroupLabelComponent,
    ChatBot,
    ChatbotMainMenu,
    ChatbotWelcomeMenu,
    ChatbotSessionsMenu,
    ChatbotChattingMenu,
    ChatbotStartMenu,
    ChatbotRequestsMenu,
    ChatbotNotificationMenu,
    emptyComponent,
    ImageViewer,
    ChatbotSpeechMenu,
    StartPageComponent,
    FooterComponent,


    DiagramPageComponent,
    ShowTopicComponent,
    SafePipe,
    OerViewComponent,
    NotFoundComponent,




  ],
  imports: [
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    DragDropModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    HttpClientModule,
    MatDialogModule,
    MatTreeModule,
    MatTabsModule,
    MatRippleModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SocketIoModule.forRoot(config),
    PickerModule,
    CardModule,
    ButtonModule,
    LazyLoadImageModule,
    MatSnackBarModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    MatSidenavModule,
    MatExpansionModule,
    PdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
