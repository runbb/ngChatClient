import { Component } from "@angular/core";
import { connect,SocketOptions } from "nativescript-socket.io";
import { Page } from "ui/page";
import { ListView } from "ui/list-view";
import { TextField } from "ui/text-field";
import { TabViewItem } from "ui/tab-view";
import { setTimeout } from 'timer'

import * as application from "application";
import * as platform from "platform";

import dialogs = require("ui/dialogs");
import _ = require("underscore");

declare var NSIndexPath,UITableViewScrollPosition,unescape,android;

class Message{
  constructor(public avatar:string, public power:string,public from:string,public message:string,
              public background:string,public color:string,public messageColor:string){}
}

class Notification{
  constructor(public image:string,public message:string){}
}

function _unescape(code:string): string{
  return _.unescape(code).replace(/&#x3C;/,'<');
}

@Component({
  selector: "my-app",
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public messages: Array<Message>;
  public broadcasts: Array<Message>;
  public notifications: Array<Notification>;
  public users: Array<any>;
  public user: any;
  public rooms: Array<any>;
  public room: any;
  public powers: Array<any>;
  public server: string = "http://khaleejchat.com/";

  private socket;
  public userid: string;
  private connection_name: string = "Android Application";
  constructor(public page:Page){
    this.messages = [];
    this.notifications = [];
    this.users = [];
    this.powers = [];
    this.broadcasts = [];
    this.rooms = [];
  }

  connection(){
    var server:TextField = <TextField> this.page.getViewById("serverip");
    var username:TextField = <TextField> this.page.getViewById("username");
    var password:TextField = <TextField> this.page.getViewById("password");
    this.server = server.text;
    
    this.messages = [];
    this.notifications = [];
    this.users = [];
    this.powers = [];
    this.broadcasts = [];
    this.rooms = []; 

    this.socket = connect(this.server, <SocketOptions> { transports: ['polling', 'websocket'] });
    this.socket.on('connect', () => {
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification(this.server + 'pic.png','تم الاتصال بنجاح'));
      notifications.refresh();

      this.socket.emit('msg', {cmd: "login" , data:{
        username: username.text,
        password: password.text,
        stealth: true,
        fp: this.connection_name, 
        refr: this.connection_name, 
        r: this.connection_name
      }});
    });

    this.socket.on('msg', (data) => {
      if(typeof data.data === "string" && data.cmd != 'u-'){
          data.data = JSON.parse(unescape(data.data));
      }

      if(data.cmd == "login"){ // on login to server
        if(data.data.msg = "ok"){
          this.userid = data.data.id;
        }
      }

      if(data.cmd == "msg"){ // room message 
        var messages:ListView = <ListView> this.page.getViewById("listMessages");
        var sico = '';
        var user = this.users.filter(value => value.id == data.data.uid)[0];
        var power = this.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];
        if(power){
          if(power.ico != ''){
            sico = this.server + "sico/" + power.ico;
          }
        }

        if(data.data.bg == "#"){
          data.data.bg = "#FFFFFF";
        }

        if(data.data.ucol == "#"){
          data.data.ucol = "#000000";
        }

        if(data.data.mcol == "#"){
          data.data.mcol = "#000000";
        }
        
        data.data.bg    = data.data.bg    || '#FFFFFF';
        data.data.bg    = data.data.bg.replace(/\/|\\/,'');
        data.data.ucol  = data.data.ucol  || '#000000';
        data.data.ucol  = data.data.ucol.replace(/\/|\\/,'');
        data.data.mcol  = data.data.mcol  || '#000000';
        data.data.mcol  = data.data.mcol.replace(/\/|\\/,'');
        
        this.messages.push( new Message(this.server + data.data.pic, sico, _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))
                                        , data.data.bg, data.data.ucol, data.data.mcol) );
        messages.refresh();  
        
        if (messages.ios) {
            messages.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                NSIndexPath.indexPathForItemInSection(this.messages.length-1, 0),
                UITableViewScrollPosition.UITableViewScrollPositionTop,
                true
            );
        }
        else {
            messages.scrollToIndex(this.messages.length-1); 
        }
      }

      if (data.cmd == "not"){ // notifications
        var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
        var user = this.users.filter(value => value.id == data.data.user)[0] || { pic: "" };
        this.notifications.unshift(new Notification(this.server+ user.pic,_unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
        notifications.refresh();
      }

      if(data.cmd == "ulist"){ // users online
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        data.data.forEach(element => {
          var sico = '';
          var user = this.users.filter(value => value.id == element.id)[0];
          var power = this.powers.filter(value => {
            if(user) { 
              return value.name == user.power;
            }else{ return false;}
          })[0];

          if(power){
            if(power.ico != ''){
              sico = this.server + "sico/" + power.ico;
            }
          }

          if(element.bg == "#"){
            element.bg = "#FFFFFF";
          }

          if(element.ucol == "#"){
            element.ucol = "#000000";
          }

          if(element.mcol == "#"){
            element.mcol = "#000000";
          }
          
          element.bg    = element.bg    || '#FFFFFF';
          element.bg    = element.bg.replace(/\/|\\/,'');
          element.ucol  = element.ucol  || '#000000';
          element.ucol  = element.ucol.replace(/\/|\\/,'');
          element.mcol  = element.mcol  || '#000000';
          element.mcol  = element.mcol.replace(/\/|\\/,'');

          element.sico  = sico;

          this.users.push(element);          
        });
        onlines.refresh();
      }

      if(data.cmd == "u-"){ // user left
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.users.splice(this.users.indexOf(this.users.filter(v => v.id == data.data)[0]), 1);
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "u+"){ // user join
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        
        var sico = '';
        var user = this.users.filter(value => value.id == data.data.id)[0];
        var power = this.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];

        if(power){
          if(power.ico != ''){
            sico = this.server + "sico/" + power.ico;
          }
        }

        if(data.data.bg == "#"){
          data.data.bg = "#FFFFFF";
        }

        if(data.data.ucol == "#"){
          data.data.ucol = "#000000";
        }

        if(data.data.mcol == "#"){
          data.data.mcol = "#000000";
        }
        
        data.data.bg    = data.data.bg    || '#FFFFFF';
        data.data.bg    = data.data.bg.replace(/\/|\\/,'');
        data.data.ucol  = data.data.ucol  || '#000000';
        data.data.ucol  = data.data.ucol.replace(/\/|\\/,'');
        data.data.mcol  = data.data.mcol  || '#000000';
        data.data.mcol  = data.data.mcol.replace(/\/|\\/,'');

        data.data.sico  = sico;
        this.users.push(data.data);
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "u^"){ // user edit
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.users.splice(this.users.indexOf(this.users.filter(v => v.id == data.data.id)[0]), 1);
        this.users.push(data.data);
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "ur"){ // user join room
        if(this.rooms == [] || this.users == []){
          return;
        }

        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        var user = this.users[this.users.indexOf(this.users.filter(v => v.id == data.data[0])[0])];
        if (user == undefined){
          user = {
            roomid: ''
          }
        }
        user.roomid = data.data[1];
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "powers"){ // powers
        this.powers = data.data;
        for(var i=0; i< this.powers.length;i++)
        {
          var pname= this.powers[i].name;
          if(pname==''){pname='_';}
          this.powers[pname] = this.powers[i];
        }
      }

      if(data.cmd == 'bc'){ // broadcast
        var broadcasts:ListView = <ListView> this.page.getViewById("listBroadcast");
        var sico = '';
        var user = this.users.filter(value => value.id == data.data.uid)[0];
        var power = this.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];

        if(power){
          if(power.ico != ''){
            sico = this.server + "sico/" + power.ico;
          }
        }

        if(data.data.bg == "#"){
          data.data.bg = "#FFFFFF";
        }

        if(data.data.ucol == "#"){
          data.data.bg = "#FFFFFF";
        }

        if(data.data.mcol == "#"){
          data.data.bg = "#FFFFFF";
        }

        data.data.bg    = data.data.bg    || '#FFFFFF';
        data.data.bg    = data.data.bg.replace(/\/|\\/,'');
        data.data.ucol  = data.data.ucol  || '#000000';
        data.data.ucol  = data.data.ucol.replace(/\/|\\/,'');
        data.data.mcol  = data.data.mcol  || '#000000';
        data.data.mcol  = data.data.mcol.replace(/\/|\\/,'');
        
        this.broadcasts.unshift( new Message(this.server + data.data.pic, sico, _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))
                                        , data.data.bg, data.data.ucol, data.data.mcol) );
        broadcasts.refresh();  
        
        if (broadcasts.ios) {
            broadcasts.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                NSIndexPath.indexPathForItemInSection(0, 0),
                UITableViewScrollPosition.UITableViewScrollPositionTop,
                true
            );
        }
        else {
            broadcasts.scrollToIndex(0);
        }
      }

      if(data.cmd == "rlist"){ // rooms list
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        data.data.forEach(element => {
          element.online = 0;
          this.rooms.push(element);          
        });
        rooms.refresh();
        this.updateRooms();
      }

      if(data.cmd == "r+"){ // add room
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.rooms.push(data.data);
        rooms.refresh();
      }

      if(data.cmd == "r-"){ // remove room
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.rooms.splice(this.rooms.indexOf(this.rooms.filter(v => v.id == data.data.id)[0]), 1);
        rooms.refresh();
      }

      if(data.cmd == "r^"){ // room edit
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.rooms.splice(this.rooms.indexOf(this.rooms.filter(v => v.id == data.data.id)[0]), 1);
        this.rooms.push(data.data);
        rooms.refresh();
      }
    });

    this.socket.on('disconnect', (data) => { 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification(this.server + 'pic.png','اوه لا !! انقطع الاتصال'));
      notifications.refresh();
    });
    this.socket.on('connect_error', (data) => {
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification(this.server + 'pic.png','اوه لا !! خطأ في الاتصال'));
      notifications.refresh();  
    });
    this.socket.on('connect_timeout', (data) => { 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification(this.server + 'pic.png','اوه لا !! لا يمكنني الاتصال بالخادم'));
      notifications.refresh();
    });
    this.socket.on('reconnect_attempt', (data) => { 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification(this.server + 'pic.png','انا اقوم باعادة الاتصال بالخادم الان'));
      notifications.refresh();
    });
    this.socket.on('error', (data) => { 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification(this.server + 'pic.png','اوه لا !! حدث خطأ ما'));
      notifications.refresh();
    });

  }

  sendAdvertising(){
    dialogs.prompt("إرسال إهلان", "").then(r => {
        if(r.result){ // on press ok
          // send Advertising
          this.socket.emit("msg", {cmd: "pmsg", data: { msg: r.text }});
        }
    });
  }

  onItemTap(evt){
    
  }

  joinRoom(event,roomid){ // join room
    // join room                                room id
    this.socket.emit("msg",{cmd:"rjoin", data: {id: this.rooms.filter(v => v.id == roomid)[0].id } });
  };

  sendMessage(){ // send message to user room
    // get message input
    var textfield:TextField= <TextField> this.page.getViewById("messageinput");
    // when textfield is blank dont send anything
    if(textfield.text.trim() == "") return;
    // send message
    this.socket.emit("msg",{cmd:"msg", data: {msg: textfield.text} });
    // set textfield blank
    textfield.text = "";
  }

  sendBroadcast(){ // send broadscast
    //get broadcast input
    var textfield:TextField= <TextField> this.page.getViewById("broadcastinput");
    // when textfield is blank dont send anything
    if(textfield.text.trim() == "") return;
    // send broadcast
    this.socket.emit("msg",{cmd:"bc", data: { msg: textfield.text, link: null } });
    // set textfield blank
    textfield.text = "";
  }

  sendInfo(){
    // this.user = this.users.filter((value,index) => value.id == this.userid)[0];
    // this.room = this.rooms.filter(v => v.id == this.user.roomid)[0];
    //
    // alert(JSON.stringify(this.user,null,4) + "\n" + JSON.stringify(this.room,null,4));
  }

  updateRooms (rooms?:ListView){ // refresh room online users
    if(rooms == null){
      rooms = <ListView> this.page.getViewById("listRooms");      
    }

    this.rooms.sort((a, b) => b.online - a.online );

    this.rooms.forEach((element,index)=>{
      var usersRoom = this.users.filter(v => v.roomid == element.id);
      this.rooms[index].online = usersRoom.length;
    });

    rooms.refresh()
    
    setTimeout(()=>{
      var tabNotifications:TabViewItem = <TabViewItem>this.page.getViewById("tabNotifications");
      var tabOnline:TabViewItem = <TabViewItem>this.page.getViewById("tabOnlines");
      tabNotifications.title = "الأشعارات " + this.notifications.length;
      tabOnline.title = "المتصلين " + this.users.length;

      this.updateRooms(rooms);
    },1000);
  }
}