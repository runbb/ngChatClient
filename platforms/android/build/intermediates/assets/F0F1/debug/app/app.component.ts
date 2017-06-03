import { Component } from "@angular/core";
import { connect,SocketOptions } from "nativescript-socket.io";
import { Page } from "ui/page"
import { ListView } from "ui/list-view"
import { TextField } from "ui/text-field"
import _ = require("underscore");
declare var NSIndexPath,UITableViewScrollPosition,unescape;

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
  public powers: Array<any>;
  public server: string = "http://khaleejchat.com/";

  private socket;
  private connection_name: string = "Android Application";
  constructor(public page:Page){
    this.messages = [];
    this.notifications = [];
    this.users = [];
    this.powers = [];
    this.broadcasts = [];
  }

  connection(){
    var server:TextField = <TextField> this.page.getViewById("serverip");
    var username:TextField = <TextField> this.page.getViewById("username");
    var password:TextField = <TextField> this.page.getViewById("password");
    this.server = server.text;
    
    this.socket = connect(this.server, <SocketOptions> { transports: ['polling', 'websocket'] });
    this.socket.on('connect', () => {
      var listview:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification('','تم الاتصال بنجاح'));
      listview.refresh();

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

      if(data.cmd == "msg"){ // room message 
        var listview:ListView = <ListView> this.page.getViewById("listMessages");
        
        var user = this.users.filter(value => value.id == data.data.uid)[0];
        var power = this.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];

        data.data.bg    = data.data.bg   || '#FFFFFF';
        data.data.ucol  = data.data.ucol || '#000000';
        data.data.mcol  = data.data.mcol || '#000000';
        this.messages.push( new Message(this.server + data.data.pic, (power ? this.server + "sico/" + power.ico : ''), _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))
                                        , data.data.bg, data.data.ucol, data.data.mcol) );
        listview.refresh();  
        
        if (listview.ios) {
            listview.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                NSIndexPath.indexPathForItemInSection(this.messages.length-1, 0),
                UITableViewScrollPosition.UITableViewScrollPositionTop,
                true
            );
        }
        else {
            listview.scrollToIndex(this.messages.length-1); 
        }
      }

      if (data.cmd == "not"){ // notifications
        var listview:ListView = <ListView> this.page.getViewById("listNotifications");
        var user = this.users.filter(value => value.id == data.data.user)[0] || { pic: "" };
        this.notifications.unshift(new Notification(this.server+user.pic,_unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
        listview.refresh();
      }

      if(data.cmd == "ulist"){ // users online
        var listview:ListView = <ListView> this.page.getViewById("listonline");
        this.users = data.data;
        listview.refresh();
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
        var listview:ListView = <ListView> this.page.getViewById("listBroadcast");
        
        var user = this.users.filter(value => value.id == data.data.uid)[0];
        var power = this.powers.filter(value => {
          if(user) { 
            return value.name == user.power;
          } else { return false}
        })[0];

        data.data.bg    = data.data.bg   || '#FFFFFF';
        data.data.ucol  = data.data.ucol || '#000000';
        data.data.mcol  = data.data.mcol || '#000000';
        this.broadcasts.unshift( new Message(this.server + data.data.pic, (power ? this.server + "sico/" + power.ico : ''), _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))
                                        , data.data.bg, data.data.ucol, data.data.mcol) );
        listview.refresh();  
        
        if (listview.ios) {
            listview.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                NSIndexPath.indexPathForItemInSection(0, 0),
                UITableViewScrollPosition.UITableViewScrollPositionTop,
                true
            );
        }
        else {
            listview.scrollToIndex(0);
        }
      } 
    });

    this.socket.on('disconnect', (data) => { 
      var listview:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification('','اوه لا !! انقطع الاتصال'));
      listview.refresh();
    });
    this.socket.on('connect_error', (data) => {
      var listview:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification('','اوه لا !! خطأ في الاتصال'));
      listview.refresh();  
    });
    this.socket.on('connect_timeout', (data) => { 
      var listview:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification('','اوه لا !! لا يمكنني الاتصال بالخادم'));
      listview.refresh();
    });
    this.socket.on('reconnect_attempt', (data) => { 
      var listview:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification('','انا اقوم باعادة الاتصال بالخادم الان'));
      listview.refresh();
    });
    this.socket.on('error', (data) => { 
      var listview:ListView = <ListView> this.page.getViewById("listNotifications");
      this.notifications.unshift(new Notification('','اوه لا !! حدث خطأ ما'));
      listview.refresh();
    });

  }

  onItemTap(evt){
    
  }

  sendMessage(){
    var textfield:TextField= <TextField> this.page.getViewById("messageinput");
    if(textfield.text.trim() == "") return;
    this.socket.emit("msg",{cmd:"msg", data: {msg: textfield.text} });
    textfield.text = "";
  }

  sendBroadcast(){
    var textfield:TextField= <TextField> this.page.getViewById("broadcastinput");
    if(textfield.text.trim() == "") return;
    this.socket.emit("msg",{cmd:"bc", data: { msg: textfield.text, link: null } });
    textfield.text = "";
  }
}