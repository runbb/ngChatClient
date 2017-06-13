import { Component } from "@angular/core";
import { Page } from "ui/page";

import { Connection } from "./services/connection";

@Component({
  selector: "my-app",
  providers: [
    Connection
    ],
  template: '<page-router-outlet></page-router-outlet>',
})
export class AppComponent {}