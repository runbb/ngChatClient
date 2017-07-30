import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router"
import { connect,SocketOptions } from "nativescript-socket.io";
import { Page } from "ui/page";
import { ListView } from "ui/list-view";
import { TextField } from "ui/text-field";
import { Image } from "ui/image";
import { Button } from "ui/button";
import { TabViewItem } from "ui/tab-view";
import { setTimeout , clearTimeout } from 'timer';
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
  constructor(public page:Page, private connect:Connection, public router:Router,private routerExtensions: RouterExtensions){
    this.connect.messages = [];
    this.connect.notifications = [];
    this.connect.users = [];
    this.connect.powers = [];
    this.connect.broadcasts = [];
    this.connect.rooms = [];
    this.connect.connected.next(false);

    this.connect.socket.on('msg', (data) => {
      this.connect.connected.next(true);

      if(typeof data.data === "string" && data.cmd != 'u-'){
          data.data = JSON.parse(unescape(data.data));
      }

      if(data.cmd == "login"){ // on login to server
        switch(data.data.msg){
          case "ok":
            this.connect.userid = data.data.id;
            dialogs.alert({
              title: "تسجيل الدخول",
              message: 'تم تسجيل الدخول بشكل صحيح',
              okButtonText: "حسنا"
            });
            this.router.navigate(['main']);
          break;
          case "badname":
            this.connect.userid = data.data.id;
            dialogs.alert({
              title: "تسجيل الدخول",
              message: 'يرجى إختيار أسم آخر',
              okButtonText: "حسنا"
            });
            this.routerExtensions.back();
            this.connect.socket.disconnect()
          break;
          case "usedname":
            this.connect.userid = data.data.id;
            dialogs.alert({
              title: "التسجيل",
              message: 'هذا الإسم مسجل من قبل',
              okButtonText: "حسنا"
            });
            this.routerExtensions.back();
            this.connect.socket.disconnect()
          break;
          case "badpass":
            this.connect.userid = data.data.id;
            dialogs.alert({
              title: "التسجيل",
              message: 'كلمه المرور غير مناسبه',
              okButtonText: "حسنا"
            });
            this.routerExtensions.back();
            this.connect.socket.disconnect()
          break;
          case "wrong":
            this.connect.userid = data.data.id;
            dialogs.alert({
              title: "تسجيل الدخول",
              message: 'كلمه المرور غير صحيحه',
              okButtonText: "حسنا"              
            });
            this.routerExtensions.back();
            this.connect.socket.disconnect()
          break;
          case "reg":
            this.connect.userid = data.data.id;
            dialogs.alert({
              title: "التسجيل",
              message: 'تم تسجيل العضويه بنجاح !',
              okButtonText: "حسنا"              
            });
          break;
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
        try{
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
        }catch(e){}
      }

      if (data.cmd == "not"){ // notifications
        var notifications:ListView = <ListView> this.page.getViewById("listNotifications");
        var user = this.connect.users.filter(value => value.id == data.data.user)[0] || { pic: "" };
        this.connect.notifications.unshift(new Notification(this.connect.server + user.pic,_unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
        try{
          notifications.refresh();
        }catch(e){}
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
        try{
          onlines.refresh();
        }catch(e){}
        this.updateUsers(onlines);
      }

      if(data.cmd == "u-"){ // user left
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.users.splice(this.connect.users.indexOf(this.connect.users.filter(v => v.id == data.data)[0]), 1);
        try{
          onlines.refresh();
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
      }

      if(data.cmd == "u+"){ // user join
        var onlines:ListView = <ListView> this.page.getViewById("listOnline");
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        
        var sico = '';
        var power = this.connect.powers.filter(v => v.name == data.data.power)[0];

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
        try{
          onlines.refresh();
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
      }

      if(data.cmd == "u^"){ // user edit
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
        this.connect.users[this.connect.users.indexOf(this.connect.users.filter(v => v.id == data.data.id)[0])] = data.data;
        try{
          onlines.refresh();
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
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
        try{
          onlines.refresh();
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
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

        try{
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
        }catch(e){}
      }

      if(data.cmd == "rlist"){ // rooms list
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        data.data.forEach(element => {
          element.online = 0;
          this.connect.rooms.push(element);          
        });
        try{
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
      }

      if(data.cmd == "r+"){ // add room
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.rooms.push(data.data);
        try{
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
      }

      if(data.cmd == "r-"){ // remove room
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.rooms.splice(this.connect.rooms.indexOf(this.connect.rooms.filter(v => v.id == data.data.id)[0]), 1);
        try{
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
      }

      if(data.cmd == "r^"){ // room edit
        var rooms:ListView = <ListView> this.page.getViewById("listRooms");
        this.connect.rooms.splice(this.connect.rooms.indexOf(this.connect.rooms.filter(v => v.id == data.data.id)[0]), 1);
        this.connect.rooms.push(data.data);
        try{
          rooms.refresh();
          this.updateRooms(rooms);
        }catch(e){}
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

      dialogs.alert({
        title: "خطأ",
        message: 'اوه لا !! انقطع الاتصال',
        okButtonText: 'حسنا'
      });
      this.routerExtensions.back();
      this.connect.socket.disconnect()

      try{
        notifications.refresh();
      }catch(e){}
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

      dialogs.alert({
        title: "خطأ",
        message: 'اوه لا !! خطأ في الاتصال',
        okButtonText: 'حسنا'
      });
      this.routerExtensions.back();
      this.connect.socket.disconnect()

      try{
        notifications.refresh();  
      }catch(e){}
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

      dialogs.alert({
        title: "خطأ",
        message: 'اوه لا !! لا يمكنني الاتصال بالخادم',
        okButtonText: 'حسنا'
      });
      this.routerExtensions.back();
      this.connect.socket.disconnect()      

      try{
        notifications.refresh();
      }catch(e){}
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

      dialogs.alert({
        title: "خطأ",
        message: 'انا اقوم باعادة الاتصال بالخادم الان',
        okButtonText: 'حسنا'
      });
      this.routerExtensions.back();
      this.connect.socket.disconnect()

      try{
        notifications.refresh();
      }catch(e){}
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

      dialogs.alert({
        title: "خطأ",
        message: 'اوه لا !! حدث خطأ ما',
        okButtonText: 'حسنا'
      });
      this.routerExtensions.back();
      this.connect.socket.disconnect()

      try{
        notifications.refresh();
      }catch(e){}
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
        dialogs.action({
          cancelable: true,
          cancelButtonText: "الغاء",
          title: (this.connect.user || { topic: '' }).topic,
          actions: [
            'معلوماتي',
            'تسجيل الخروج'
          ]
        }).then(result => {
          if(result == 'معلوماتي'){
            alert(JSON.stringify(this.connect.user,null,4));
          }else if(result == 'تسجيل الخروج'){
            this.connect.socket.emit('msg', {cmd: 'logout', data: {}});
          }
        })
    }else{
        let user = this.connect.users.filter(v=> v.id == id)[0];

        if(user == undefined){
          dialogs.alert({
            title: "تنبيه",
            message: "العضو غير موجود الان",
            okButtonText: "حسنا"
          });
        }
        
        dialogs.action({
          cancelable: true,
          cancelButtonText: "الغاء",
          title: (user || { topic: '' }).topic,
          actions: [
            'الملف الشخصي',
            'إعجاب'
          ]
        }).then(result => {
          if(result == 'الملف الشخصي'){
            alert(JSON.stringify(user,null,4));
          }else if(result == 'إعجاب'){
            this.connect.socket.emit('action', {cmd: 'like', data: { id: user.id }});
          }
        });
    }
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

    try{
      rooms.refresh()
    }catch(e){}
  }

  updateUsers (users?: ListView){ // refresh room online users
    if(users == null){
      users = <ListView> this.page.getViewById("listOnline");      
    }

    this.connect.lengthUsers.next(this.connect.users.length);

    this.connect.user = this.connect.users.filter((value,index) => value.id == this.connect.userid)[0];
    if(this.connect.user){
      this.connect.room = this.connect.rooms.filter(v => v.id == this.connect.user.roomid)[0];
    }
    if(this.connect.user){
      var useravatar:Image = <Image> this.page.getViewById("userAvatar");
      var usertopic:Button = <Button> this.page.getViewById("userTopic");

      useravatar.src = this.connect.server + this.connect.user.pic;
      usertopic.text = this.connect.user.topic;
    }

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

    try{
      users.refresh()
    }catch(e){}

    setTimeout(()=>{
      this.updateUsers(users);
    },1000);
  }


  showPrivate(){
    this.router.navigate(['private']);
  }
}