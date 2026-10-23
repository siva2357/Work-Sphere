import { Routes } from '@angular/router';

import { LandingPage } from '../../../views/public/landing-page/landing-page';
import { FeaturesPage } from '../../../views/public/features-page/features-page';
import { AboutPage } from '../../../views/public/about-page/about-page';
import { ContactUs } from '../../../views/public/contact-us/contact-us';

export const PUBLIC_ROUTES: Routes = [
  { path: '', component: LandingPage },
  { path: 'features', component: FeaturesPage },
  { path: 'about', component: AboutPage },
  { path: 'contact', component: ContactUs }
];
