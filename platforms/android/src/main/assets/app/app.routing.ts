import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
 
import { LoginComponent } from "./login.component"; 
import { MainComponent } from "./main.component"; 
import { PrivateComponent } from "./private.component"; 

export const Components: any = [
    LoginComponent,
    MainComponent,
    PrivateComponent
];
const routes: Routes = [
    { path: "", component: LoginComponent},
    { path: "main", component: MainComponent},
    { path: "private", component: PrivateComponent }
];
 
@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }