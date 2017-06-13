import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { connect,SocketOptions } from "nativescript-socket.io";
import { Page } from "ui/page";
import { ListView } from "ui/list-view";
import { TextField } from "ui/text-field";
import { TabViewItem } from "ui/tab-view";
import { setTimeout } from 'timer';
import { Observable, Subject } from 'rxjs';

import { Connection } from "./services/connection";

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

@Component({
  selector: "my-app",
  templateUrl: 'main.component.html'
})
export class MainComponent{
  constructor(public page:Page, private connect:Connection, public router:Router){
    this.connect.messages = [];
    this.connect.notifications = [];
    this.connect.users = [];
    this.connect.powers = [];
    this.connect.broadcasts = [];
    this.connect.rooms = [];
    this.connect.connected.next(false);

  }

  connection(){
    this.connect.connected.next(false);
    var server:TextField = <TextField> this.page.getViewById("serverip");
    var username:TextField = <TextField> this.page.getViewById("username");
    var password:TextField = <TextField> this.page.getViewById("password");
    this.connect.server = server.text;

    this.connect.socket = connect(this.connect.server, <SocketOptions> { transports: ['polling', 'websocket'] });
    this.connect.socket.on('connect', () => {
      this.connect.connected.next(true);

      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','تم الاتصال بنجاح'));
      notifications.refresh();

      this.connect.socket.emit('msg', {cmd: "login" , data:{
        username: username.text,
        password: password.text,
        stealth: true,
        fp: this.connect.connection_name, 
        refr: this.connect.connection_name, 
        r: this.connect.connection_name
      }});
    });

    this.connect.socket.on('msg', (data) => {
      this.connect.connected.next(true);

      if(typeof data.data === "string" && data.cmd != 'u-'){
          data.data = JSON.parse(unescape(data.data));
      }

      if(data.cmd == "login"){ // on login to server
        if(data.data.msg = "ok"){
          this.connect.userid = data.data.id;
        }
      }

      if(data.cmd == "msg"){ // room message 
        var messages:ListView = <ListView> this.page.getViewById("listMessages");
        var sico = '';
        var user = this.connect.users.filter(value => value.id == data.data.uid)[0];
        var power = this.connect.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];
        if(power){
          if(power.ico != ''){
            sico = this.connect.server + "sico/" + power.ico;
          }
        }
        
        data.data.ico = (user || {ico:''}).ico || '';

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
        
                
        if(this.connect.messages.length > 100){
          this.connect.messages.shift();
        }

        this.connect.messages.push( new Message((user || {id: ""}).id ,this.connect.server + data.data.pic, sico, data.data.ico != '' ? this.connect.server + "dro3/" + data.data.ico : '', _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))
                                        , data.data.bg, data.data.ucol, data.data.mcol) );
        messages.refresh();  
        
        if (messages.ios) {
            messages.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                NSIndexPath.indexPathForItemInSection(this.connect.messages.length-1, 0),
                UITableViewScrollPosition.UITableViewScrollPositionTop,
                true
            );
        }
        else {
            messages.scrollToIndex(this.connect.messages.length-1); 
        }
      }

      if (data.cmd == "not"){ // notifications
        var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
        var user = this.connect.users.filter(value => value.id == data.data.user)[0] || { pic: "" };
        this.connect.notifications.unshift(new Notification(this.connect.server + user.pic,_unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
        notifications.refresh();
      }

      if(data.cmd == "ulist"){ // users online
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        data.data.forEach(element => {
          var sico = '';
          var power = this.connect.powers.filter(value => {
              return value.name == element.power;
          })[0];

          if(power){
            if(power.ico != ''){
              sico = this.connect.server + "sico/" + power.ico;
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
          
          element.ico = (element || {ico:''}).ico || '';

          element.bg    = element.bg    || '#FFFFFF';
          element.bg    = element.bg.replace(/\/|\\/,'');
          element.ucol  = element.ucol  || '#000000';
          element.ucol  = element.ucol.replace(/\/|\\/,'');
          element.mcol  = element.mcol  || '#000000';
          element.mcol  = element.mcol.replace(/\/|\\/,'');

          element.sico  = sico;

          data.data.dico = data.data.ico != '' ? this.connect.server + "dro3/" + data.data.ico : '';

          this.connect.users.push(element);          
        });
        onlines.refresh();
        this.updateUsers(onlines);
      }

      if(data.cmd == "u-"){ // user left
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.users.splice(this.connect.users.indexOf(this.connect.users.filter(v => v.id == data.data)[0]), 1);
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "u+"){ // user join
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        
        var sico = '';
        var power = this.connect.powers.filter(value => {
            return value.name == data.data.power;
        })[0];

        if(power){
          if(power.ico != ''){
            sico = this.connect.server + "sico/" + power.ico;
          }
        }

        data.data.ico = (data.data || {ico:''}).ico || '';                

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

        data.data.dico = data.data.ico != '' ? this.connect.server + "dro3/" + data.data.ico : '';

        data.data.sico  = sico;
        this.connect.users.push(data.data);
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "u^"){ // user edit
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.users.splice(this.connect.users.indexOf(this.connect.users.filter(v => v.id == data.data.id)[0]), 1);
        var sico = '';
        var power = this.connect.powers.filter(value => {
            return value.name == data.data.power;
        })[0];

        if(power){
          if(power.ico != ''){
            sico = this.connect.server + "sico/" + power.ico;
          }
        }

        data.data.ico = (data.data || {ico:''}).ico || '';                

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

        data.data.dico = data.data.ico != '' ? this.connect.server + "dro3/" + data.data.ico : '';

        data.data.sico  = sico;

        this.connect.users.push(data.data);
        onlines.refresh();
        rooms.refresh();
      }

      if(data.cmd == "ur"){ // user join room
        if(this.connect.rooms == [] || this.connect.users == []){
          return;
        }

        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        var user = this.connect.users[this.connect.users.indexOf(this.connect.users.filter(v => v.id == data.data[0])[0])];
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
        this.connect.powers = data.data;
        for(var i=0; i< this.connect.powers.length;i++)
        {
          var pname= this.connect.powers[i].name;
          if(pname==''){
              pname='_';
            }
          this.connect.powers[pname] = this.connect.powers[i];
        }
      }

      if(data.cmd == 'bc'){ // broadcast
        var broadcasts:ListView = <ListView> this.page.getViewById("listBroadcast");
        var sico = '';
        var user = this.connect.users.filter(value => value.id == data.data.uid)[0];
        var power = this.connect.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];

        if(power){
          if(power.ico != ''){
            sico = this.connect.server + "sico/" + power.ico;
          }
        }

        data.data.ico = (user || {ico:''}).ico || '';

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
        
                
        if(this.connect.broadcasts.length > 100){
          this.connect.broadcasts.pop();
        }

        this.connect.broadcasts.unshift( new Message((user || {id: ""}).id , this.connect.server + data.data.pic, sico, data.data.ico != '' ? this.connect.server + "dro3/" + data.data.ico : '', _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))
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
          this.connect.rooms.push(element);          
        });
        rooms.refresh();
        this.updateRooms();
      }

      if(data.cmd == "r+"){ // add room
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.rooms.push(data.data);
        rooms.refresh();
      }

      if(data.cmd == "r-"){ // remove room
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.rooms.splice(this.connect.rooms.indexOf(this.connect.rooms.filter(v => v.id == data.data.id)[0]), 1);
        rooms.refresh();
      }

      if(data.cmd == "r^"){ // room edit
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.rooms.splice(this.connect.rooms.indexOf(this.connect.rooms.filter(v => v.id == data.data.id)[0]), 1);
        this.connect.rooms.push(data.data);
        rooms.refresh();
      }
    });

    this.connect.socket.on('disconnect', (data) => {
      this.connect.connected.next(false);
      
      this.connect.messages = [];
      this.connect.users = [];
      this.connect.powers = [];
      this.connect.broadcasts = [];
      this.connect.rooms = []; 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','اوه لا !! انقطع الاتصال'));
      notifications.refresh();
    });
    this.connect.socket.on('connect_error', (data) => {
      this.connect.connected.next(false);

      this.connect.messages = [];
      this.connect.users = [];
      this.connect.powers = [];
      this.connect.broadcasts = [];
      this.connect.rooms = []; 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','اوه لا !! خطأ في الاتصال'));
      notifications.refresh();  
    });
    this.connect.socket.on('connect_timeout', (data) => { 
      this.connect.connected.next(false);

      this.connect.messages = [];
      this.connect.users = [];
      this.connect.powers = [];
      this.connect.broadcasts = [];
      this.connect.rooms = []; 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','اوه لا !! لا يمكنني الاتصال بالخادم'));
      notifications.refresh();
    });
    this.connect.socket.on('reconnect_attempt', (data) => { 
      this.connect.connected.next(false);

      this.connect.messages = [];
      this.connect.users = [];
      this.connect.powers = [];
      this.connect.broadcasts = [];
      this.connect.rooms = []; 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','انا اقوم باعادة الاتصال بالخادم الان'));
      notifications.refresh();
    });
    this.connect.socket.on('error', (data) => { 
      this.connect.connected.next(false);

      this.connect.messages = [];
      this.connect.users = [];
      this.connect.powers = [];
      this.connect.broadcasts = [];
      this.connect.rooms = []; 
      var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
      this.connect.notifications.unshift(new Notification(this.connect.server + 'pic.png','اوه لا !! حدث خطأ ما'));
      notifications.refresh();
    });

  }

  sendAdvertising(){
    dialogs.prompt({
      title: "ارسال الاعلان",
      cancelable: true,
      message: "ادخل نص الاعلان",
      cancelButtonText: "الغاء",
      okButtonText: "ارسال"
    }).then(r => {
        if(r.result){ // on press ok
          // send Advertising
          this.connect.socket.emit("msg", {cmd: "pmsg", data: { msg: r.text }});
        }
    });
  }

  onItemTap(evt){
    
  }

  joinRoom(event,roomid){ // join room
    // join room                                room id
    this.connect.socket.emit("msg",{cmd:"rjoin", data: {id: this.connect.rooms.filter(v => v.id == roomid)[0].id } });
  };

  sendMessage(){ // send message to user room
    // get message input
    var textfield:TextField= <TextField> this.page.getViewById("messageinput");
    // when textfield is blank dont send anything
    if(textfield.text.trim() == "") return;
    // send message
    this.connect.socket.emit("msg",{cmd:"msg", data: {msg: textfield.text} });
    // set textfield blank
    textfield.text = "";
  }

  sendBroadcast(){ // send broadscast
    //get broadcast input
    var textfield:TextField= <TextField> this.page.getViewById("broadcastinput");
    // when textfield is blank dont send anything
    if(textfield.text.trim() == "") return;
    // send broadcast
    this.connect.socket.emit("msg",{cmd:"bc", data: { msg: textfield.text, link: null } });
    // set textfield blank
    textfield.text = "";
  }

  showInfo(id?:string){ // show user information
    if(typeof id != "string"){
        alert(JSON.stringify(this.connect.user,null,4) + "\n" + JSON.stringify(this.connect.room,null,4));
    }else{
        var user = this.connect.users.filter(v=> v.id == id)[0];
        var room = this.connect.rooms.filter(v=> v.id == user.roomid)[0];

        if(user == undefined){
          dialogs.alert({
            title: "تنبيه",
            message: "العضو غير موجود الان"
          });
        }

        alert(JSON.stringify(user,null,4) + 
        "\n" + 
        JSON.stringify(room,null,4));
    }
    var options = {
        title: "Race Selection",
        message: "Choose your race",
        cancelButtonText: "Cancel",
        actions: ["Human", "Elf", "Dwarf", "Orc"]
    };
    dialogs.action(options).then((result) => { 
        console.log(result);
    });
  }

  updateRooms (rooms?:ListView){ // refresh room online users
    if(rooms == null){
      rooms = <ListView> this.page.getViewById("listRooms");      
    }

    this.connect.rooms.sort((a, b) => b.online - a.online );

    this.connect.rooms.forEach((element,index)=>{
      var usersRoom = this.connect.users.filter(v => v.roomid == element.id);
      this.connect.rooms[index].online = usersRoom.length;
    });

    rooms.refresh()
    
    setTimeout(()=>{
      this.updateRooms(rooms);
    },1000);
  }

  updateUsers (users?:ListView){ // refresh room online users
    if(users == null){
      users = <ListView> this.page.getViewById("listOnline");      
    }

    this.connect.user = this.connect.users.filter((value,index) => value.id == this.connect.userid)[0];
    this.connect.room = this.connect.rooms.filter(v => v.id == this.connect.user)[0];


    this.connect.users.sort((a, b) => {
      if(b.rep == undefined || b.rep == undefined){
        return;
      }
      return b.rep - a.rep;
    } );

    this.connect.users.forEach((element,index)=>{
      var sico = '';
      var power = this.connect.powers.filter(value => {
          return value.name == this.connect.users[index].power;
      })[0];

      if(power){
        if(power.ico != ''){
          sico = this.connect.server + "sico/" + power.ico;
        }
      }
      this.connect.users[index].ico = (this.connect.users[index] || {ico:''}).ico || '';
      this.connect.users[index].dico = this.connect.users[index].ico != '' ? this.connect.server + "dro3/" + this.connect.users[index].ico : '';
      this.connect.users[index].sico = sico;

    });

    users.refresh()
    
    setTimeout(()=>{
      this.updateUsers(users);
    },1000);
  }


  showPrivate(){
    this.router.navigate(['private']);
  }
}