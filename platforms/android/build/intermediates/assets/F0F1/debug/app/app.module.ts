import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppComponent } from "./app.component";
import { Components, AppRoutingModule} from "./app.routing";
import { Connection } from "./services/connection";

@NgModule({
  declarations: [AppComponent, ...Components],
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    NativeScriptModule,
    AppRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [
    Connection
  ]
})
export class AppModule {}
