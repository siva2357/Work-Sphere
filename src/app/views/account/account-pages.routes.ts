import { Routes } from '@angular/router';


import { Login } from './login/login';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { EmailVerification } from './email-verification/email-verification';
import { SignUp } from './sign-up/sign-up';

export const ACCOUNT_ROUTES: Routes = [
    { path: 'signup', component: SignUp },
    { path: 'email-verification', component: EmailVerification },
    { path: 'login', component: Login },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword }
];
