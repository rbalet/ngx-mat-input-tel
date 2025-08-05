import { enableProdMode, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { AppComponent } from './app/app.component'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [provideZonelessChangeDetection(), provideAnimationsAsync()],
  })

bootstrap().catch((err) => console.error(err))
