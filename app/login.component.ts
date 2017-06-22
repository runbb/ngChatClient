import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { connect,SocketOptions } from "nativescript-socket.io";
import { Page } from "ui/page";
import { TextField } from "ui/text-field";
import { ListPicker } from "ui/list-picker";
import { setTimeout } from 'timer';
import { Observable, Subject } from 'rxjs';

import { Connection } from "./services/connection";

declare var NSIndexPath,UITableViewScrollPosition,unescape,android;

class Message{
  constructor(public id:string, public avatar:string, public power:string,public dr3:string,public from:string,public message:string,
              public background:string,public color:string,public messageColor:string){}
}

class Notification{
  constructor(public image:string,public message:string){}
}

@Component({
  selector: "my-app",
  templateUrl: 'login.component.html'
})
export class LoginComponent{
    servers: string[] = [
        "http://3ch8.com/",
        "http://flhchat.com/",
        "http://khaleejchat.com/",
    ];

    constructor(public page:Page, private connect:Connection, public router:Router){
        this.connect.messages = [];
        this.connect.notifications = [];
        this.connect.users = [];
        this.connect.powers = [];
        this.connect.broadcasts = [];
        this.connect.rooms = [];
        this.connect.connected.next(false);
    }

    connection(type: string){
        this.connect.connected.next(false);
        var server:TextField = <TextField> this.page.getViewById("serverip");
        var username:TextField = <TextField> this.page.getViewById("username");
        var password:TextField = <TextField> this.page.getViewById("password");
        var password:TextField = <TextField> this.page.getViewById("password");

        var listpicker:ListPicker = <ListPicker> this.page.getViewById("serverslist");
        this.connect.server = this.servers[listpicker.selectedIndex];

        this.connect.socket = connect(this.connect.server, <SocketOptions> { transports: ['polling', 'websocket'] });
        this.connect.socket.on('connect', () => {
            this.connect.connected.next(true);
            this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','تم الاتصال بنجاح'));
            if(type == 'user'){
                this.connect.socket.emit('msg', {cmd: "login" , data:{
                    username: username.text,
                    password: password.text,
                    stealth: true,
                    fp: this.connect.connection_name, 
                    refr: this.connect.connection_name, 
                    r: this.connect.connection_name,
                    uprofile: {}
                }});
                this.router.navigate(['main']);
            }else if(type == 'guest'){
                this.connect.socket.emit('msg', {cmd: "login" , data:{
                    username: username.text,
                    fp: this.connect.connection_name, 
                    refr: this.connect.connection_name, 
                    r: this.connect.connection_name,
                    uprofile: {}
                }});
                this.router.navigate(['main']);
            }
        });

        this.connect.socket.on('error', () => {
            this.router.navigate(['']);
        });
    }
}