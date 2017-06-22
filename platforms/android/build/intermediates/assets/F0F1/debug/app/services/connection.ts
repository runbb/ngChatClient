import { Component,Injectable } from "@angular/core";
import { connect,SocketOptions } from "nativescript-socket.io";
import { Page } from "ui/page";
import { ListView } from "ui/list-view";
import { TextField } from "ui/text-field";
import { TabViewItem } from "ui/tab-view";
import { setTimeout } from 'timer';
import { Observable, Subject } from 'rxjs';

import * as application from "application";
import * as platform from "platform";

import dialogs = require("ui/dialogs");
import _ = require("underscore");

declare var NSIndexPath,UITableViewScrollPosition,unescape,android;

class Message{
  constructor(public id:string, public avatar:string, public power:string,public dr3:string,public from:string,public message:string,
              public background:string,public color:string,public messageColor:string){}
}

class Notification{
  constructor(public image:string,public message:string){}
}

function _unescape(code:string): string{
  return _.unescape(code).replace(/&#x3C;/,'<');
}

@Injectable()
export class Connection {
  public messages: Array<Message>;
  public broadcasts: Array<Message>;
  public notifications: Array<Notification>;
  public users: Array<any>;
  public user: any;
  public rooms: Array<any>;
  public room: any;
  public powers: Array<any>;
  public server: string = "";

  public socket;
  public userid: string;
  public app_name: string = "دردشة الخليج";
  public connected: Subject<boolean> = new Subject<boolean>();
  public connection_name: string = "Android Application";
  
  constructor(){}

}