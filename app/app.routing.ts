import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
 
import { MainComponent } from "./main.component"; 
import { PrivateComponent } from "./private.component"; 

export const Components: any = [
    MainComponent,
    PrivateComponent
];
const routes: Routes = [
    { path: "", component: MainComponent},
    { path: "private", component: PrivateComponent }
];
 
@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }