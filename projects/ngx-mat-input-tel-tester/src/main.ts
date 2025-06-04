import { enableProdMode, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [provideZonelessChangeDetection()],
  })

bootstrap().catch((err) => console.error(err))
