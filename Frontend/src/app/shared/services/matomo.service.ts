// matomo.service.ts
import { Injectable } from '@angular/core';

declare var _paq: any;

@Injectable({
providedIn: 'root',
})
export class MatomoService {

trackPageView(): void {
_paq.push(['trackPageView']);
}

trackEvent(category: string, action: string, name: string): void {
_paq.push(['trackEvent', category, action, name]);
}

setUserIdByEmail(email: string): void {
_paq.push(['setUserId', email]);
}

trackOutlink(url: string, linkType: string): void {
_paq.push(['trackLink', url, linkType]);
}

trackVideoPlay(videoName: string): void {
_paq.push(['trackEvent', 'Video Interaction', 'play', videoName]);
}

trackVideoPause(videoName: string): void {
_paq.push(['trackEvent', 'Video Interaction', 'pause', videoName]);
}

trackSearchQuery(query: string): void {
_paq.push(['trackSiteSearch', query, 'Search Results']);
}
}
