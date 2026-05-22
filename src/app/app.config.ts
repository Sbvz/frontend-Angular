import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';         // ← AGREGADO

import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from '../environments/firebase';

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(),                                           // ← AGREGADO

    provideFirebaseApp(() =>
      initializeApp(environment.firebaseConfig)
    ),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore())

  ]

};
