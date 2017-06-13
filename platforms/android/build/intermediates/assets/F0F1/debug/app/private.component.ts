import { Component } from "@angular/core";
import { Page } from "ui/page";

import { Connection } from "./services/connection";

@Component({
  selector: "my-app",
  templateUrl: './private.component.html',
})
export class PrivateComponent {
    constructor(private page:Page ,private connect:Connection) {}

    refresh(){}
}