"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_socket_io_1 = require("nativescript-socket.io");
var page_1 = require("ui/page");
var timer_1 = require("timer");
var dialogs = require("ui/dialogs");
var _ = require("underscore");
var Message = (function () {
    function Message(avatar, power, from, message, background, color, messageColor) {
        this.avatar = avatar;
        this.power = power;
        this.from = from;
        this.message = message;
        this.background = background;
        this.color = color;
        this.messageColor = messageColor;
    }
    return Message;
}());
var Notification = (function () {
    function Notification(image, message) {
        this.image = image;
        this.message = message;
    }
    return Notification;
}());
function _unescape(code) {
    return _.unescape(code).replace(/&#x3C;/, '<');
}
var AppComponent = (function () {
    function AppComponent(page) {
        this.page = page;
        this.server = "http://khaleejchat.com/";
        this.connection_name = "Android Application";
        this.messages = [];
        this.notifications = [];
        this.users = [];
        this.powers = [];
        this.broadcasts = [];
        this.rooms = [];
    }
    AppComponent.prototype.connection = function () {
        var _this = this;
        var server = this.page.getViewById("serverip");
        var username = this.page.getViewById("username");
        var password = this.page.getViewById("password");
        this.server = server.text;
        this.messages = [];
        this.notifications = [];
        this.users = [];
        this.powers = [];
        this.broadcasts = [];
        this.rooms = [];
        this.socket = nativescript_socket_io_1.connect(this.server, { transports: ['polling', 'websocket'] });
        this.socket.on('connect', function () {
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'تم الاتصال بنجاح'));
            notifications.refresh();
            _this.socket.emit('msg', { cmd: "login", data: {
                    username: username.text,
                    password: password.text,
                    stealth: true,
                    fp: _this.connection_name,
                    refr: _this.connection_name,
                    r: _this.connection_name
                } });
        });
        this.socket.on('msg', function (data) {
            if (typeof data.data === "string" && data.cmd != 'u-') {
                data.data = JSON.parse(unescape(data.data));
            }
            if (data.cmd == "login") {
                if (data.data.msg = "ok") {
                    _this.userid = data.data.id;
                }
            }
            if (data.cmd == "msg") {
                var messages = _this.page.getViewById("listMessages");
                var sico = '';
                var user = _this.users.filter(function (value) { return value.id == data.data.uid; })[0];
                var power = _this.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.server + "sico/" + power.ico;
                    }
                }
                if (data.data.bg == "#") {
                    data.data.bg = "#FFFFFF";
                }
                if (data.data.ucol == "#") {
                    data.data.ucol = "#000000";
                }
                if (data.data.mcol == "#") {
                    data.data.mcol = "#000000";
                }
                data.data.bg = data.data.bg || '#FFFFFF';
                data.data.bg = data.data.bg.replace(/\/|\\/, '');
                data.data.ucol = data.data.ucol || '#000000';
                data.data.ucol = data.data.ucol.replace(/\/|\\/, '');
                data.data.mcol = data.data.mcol || '#000000';
                data.data.mcol = data.data.mcol.replace(/\/|\\/, '');
                _this.messages.push(new Message(_this.server + data.data.pic, sico, _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
                messages.refresh();
                if (messages.ios) {
                    messages.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(_this.messages.length - 1, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                }
                else {
                    messages.scrollToIndex(_this.messages.length - 1);
                }
            }
            if (data.cmd == "not") {
                var notifications = _this.page.getViewById("listNotifications");
                var user = _this.users.filter(function (value) { return value.id == data.data.user; })[0] || { pic: "" };
                _this.notifications.unshift(new Notification(_this.server + user.pic, _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
                notifications.refresh();
            }
            if (data.cmd == "ulist") {
                var onlines = _this.page.getViewById("listOnline");
                data.data.forEach(function (element) {
                    var sico = '';
                    var user = _this.users.filter(function (value) { return value.id == element.id; })[0];
                    var power = _this.powers.filter(function (value) {
                        if (user) {
                            return value.name == user.power;
                        }
                        else {
                            return false;
                        }
                    })[0];
                    if (power) {
                        if (power.ico != '') {
                            sico = _this.server + "sico/" + power.ico;
                        }
                    }
                    if (element.bg == "#") {
                        element.bg = "#FFFFFF";
                    }
                    if (element.ucol == "#") {
                        element.ucol = "#000000";
                    }
                    if (element.mcol == "#") {
                        element.mcol = "#000000";
                    }
                    element.bg = element.bg || '#FFFFFF';
                    element.bg = element.bg.replace(/\/|\\/, '');
                    element.ucol = element.ucol || '#000000';
                    element.ucol = element.ucol.replace(/\/|\\/, '');
                    element.mcol = element.mcol || '#000000';
                    element.mcol = element.mcol.replace(/\/|\\/, '');
                    element.sico = sico;
                    _this.users.push(element);
                });
                onlines.refresh();
            }
            if (data.cmd == "u-") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                _this.users.splice(_this.users.indexOf(_this.users.filter(function (v) { return v.id == data.data; })[0]), 1);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "u+") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                var sico = '';
                var user = _this.users.filter(function (value) { return value.id == data.data.id; })[0];
                var power = _this.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.server + "sico/" + power.ico;
                    }
                }
                if (data.data.bg == "#") {
                    data.data.bg = "#FFFFFF";
                }
                if (data.data.ucol == "#") {
                    data.data.ucol = "#000000";
                }
                if (data.data.mcol == "#") {
                    data.data.mcol = "#000000";
                }
                data.data.bg = data.data.bg || '#FFFFFF';
                data.data.bg = data.data.bg.replace(/\/|\\/, '');
                data.data.ucol = data.data.ucol || '#000000';
                data.data.ucol = data.data.ucol.replace(/\/|\\/, '');
                data.data.mcol = data.data.mcol || '#000000';
                data.data.mcol = data.data.mcol.replace(/\/|\\/, '');
                data.data.sico = sico;
                _this.users.push(data.data);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "u^") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                _this.users.splice(_this.users.indexOf(_this.users.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                _this.users.push(data.data);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "ur") {
                if (_this.rooms == [] || _this.users == []) {
                    return;
                }
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                var user = _this.users[_this.users.indexOf(_this.users.filter(function (v) { return v.id == data.data[0]; })[0])];
                if (user == undefined) {
                    user = {
                        roomid: ''
                    };
                }
                user.roomid = data.data[1];
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "powers") {
                _this.powers = data.data;
                for (var i = 0; i < _this.powers.length; i++) {
                    var pname = _this.powers[i].name;
                    if (pname == '') {
                        pname = '_';
                    }
                    _this.powers[pname] = _this.powers[i];
                }
            }
            if (data.cmd == 'bc') {
                var broadcasts = _this.page.getViewById("listBroadcast");
                var sico = '';
                var user = _this.users.filter(function (value) { return value.id == data.data.uid; })[0];
                var power = _this.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.server + "sico/" + power.ico;
                    }
                }
                if (data.data.bg == "#") {
                    data.data.bg = "#FFFFFF";
                }
                if (data.data.ucol == "#") {
                    data.data.bg = "#FFFFFF";
                }
                if (data.data.mcol == "#") {
                    data.data.bg = "#FFFFFF";
                }
                data.data.bg = data.data.bg || '#FFFFFF';
                data.data.bg = data.data.bg.replace(/\/|\\/, '');
                data.data.ucol = data.data.ucol || '#000000';
                data.data.ucol = data.data.ucol.replace(/\/|\\/, '');
                data.data.mcol = data.data.mcol || '#000000';
                data.data.mcol = data.data.mcol.replace(/\/|\\/, '');
                _this.broadcasts.unshift(new Message(_this.server + data.data.pic, sico, _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
                broadcasts.refresh();
                if (broadcasts.ios) {
                    broadcasts.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(0, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                }
                else {
                    broadcasts.scrollToIndex(0);
                }
            }
            if (data.cmd == "rlist") {
                var rooms = _this.page.getViewById("listRooms");
                data.data.forEach(function (element) {
                    element.online = 0;
                    _this.rooms.push(element);
                });
                rooms.refresh();
                _this.updateRooms();
            }
            if (data.cmd == "r+") {
                var rooms = _this.page.getViewById("listRooms");
                _this.rooms.push(data.data);
                rooms.refresh();
            }
            if (data.cmd == "r-") {
                var rooms = _this.page.getViewById("listRooms");
                _this.rooms.splice(_this.rooms.indexOf(_this.rooms.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                rooms.refresh();
            }
            if (data.cmd == "r^") {
                var rooms = _this.page.getViewById("listRooms");
                _this.rooms.splice(_this.rooms.indexOf(_this.rooms.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                _this.rooms.push(data.data);
                rooms.refresh();
            }
        });
        this.socket.on('disconnect', function (data) {
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! انقطع الاتصال'));
            notifications.refresh();
        });
        this.socket.on('connect_error', function (data) {
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! خطأ في الاتصال'));
            notifications.refresh();
        });
        this.socket.on('connect_timeout', function (data) {
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! لا يمكنني الاتصال بالخادم'));
            notifications.refresh();
        });
        this.socket.on('reconnect_attempt', function (data) {
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'انا اقوم باعادة الاتصال بالخادم الان'));
            notifications.refresh();
        });
        this.socket.on('error', function (data) {
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! حدث خطأ ما'));
            notifications.refresh();
        });
    };
    AppComponent.prototype.sendAdvertising = function () {
        var _this = this;
        dialogs.prompt("إرسال إهلان", "").then(function (r) {
            if (r.result) {
                // send Advertising
                _this.socket.emit("msg", { cmd: "pmsg", data: { msg: r.text } });
            }
        });
    };
    AppComponent.prototype.onItemTap = function (evt) {
    };
    AppComponent.prototype.joinRoom = function (event, roomid) {
        // join room                                room id
        this.socket.emit("msg", { cmd: "rjoin", data: { id: this.rooms.filter(function (v) { return v.id == roomid; })[0].id } });
    };
    ;
    AppComponent.prototype.sendMessage = function () {
        // get message input
        var textfield = this.page.getViewById("messageinput");
        // when textfield is blank dont send anything
        if (textfield.text.trim() == "")
            return;
        // send message
        this.socket.emit("msg", { cmd: "msg", data: { msg: textfield.text } });
        // set textfield blank
        textfield.text = "";
    };
    AppComponent.prototype.sendBroadcast = function () {
        //get broadcast input
        var textfield = this.page.getViewById("broadcastinput");
        // when textfield is blank dont send anything
        if (textfield.text.trim() == "")
            return;
        // send broadcast
        this.socket.emit("msg", { cmd: "bc", data: { msg: textfield.text, link: null } });
        // set textfield blank
        textfield.text = "";
    };
    AppComponent.prototype.sendInfo = function () {
        // this.user = this.users.filter((value,index) => value.id == this.userid)[0];
        // this.room = this.rooms.filter(v => v.id == this.user.roomid)[0];
        //
        // alert(JSON.stringify(this.user,null,4) + "\n" + JSON.stringify(this.room,null,4));
    };
    AppComponent.prototype.updateRooms = function (rooms) {
        var _this = this;
        if (rooms == null) {
            rooms = this.page.getViewById("listRooms");
        }
        this.rooms.sort(function (a, b) { return b.online - a.online; });
        this.rooms.forEach(function (element, index) {
            var usersRoom = _this.users.filter(function (v) { return v.roomid == element.id; });
            _this.rooms[index].online = usersRoom.length;
        });
        rooms.refresh();
        timer_1.setTimeout(function () {
            var tabNotifications = _this.page.getViewById("tabNotifications");
            var tabOnline = _this.page.getViewById("tabOnlines");
            tabNotifications.title = "الأشعارات " + _this.notifications.length;
            tabOnline.title = "المتصلين " + _this.users.length;
            _this.updateRooms(rooms);
        }, 1000);
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: "my-app",
        templateUrl: 'app.component.html'
    }),
    __metadata("design:paramtypes", [page_1.Page])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMEM7QUFDMUMsaUVBQStEO0FBQy9ELGdDQUErQjtBQUkvQiwrQkFBa0M7QUFLbEMsb0NBQXVDO0FBQ3ZDLDhCQUFpQztBQUlqQztJQUNFLGlCQUFtQixNQUFhLEVBQVMsS0FBWSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQzNFLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLFdBQU0sR0FBTixNQUFNLENBQU87UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsU0FBSSxHQUFKLElBQUksQ0FBTztRQUFRLFlBQU8sR0FBUCxPQUFPLENBQU87UUFDM0UsZUFBVSxHQUFWLFVBQVUsQ0FBTztRQUFRLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxpQkFBWSxHQUFaLFlBQVksQ0FBTztJQUFFLENBQUM7SUFDeEYsY0FBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBRUQ7SUFDRSxzQkFBbUIsS0FBWSxFQUFRLE9BQWM7UUFBbEMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFlBQU8sR0FBUCxPQUFPLENBQU87SUFBRSxDQUFDO0lBQzFELG1CQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRCxtQkFBbUIsSUFBVztJQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFNRCxJQUFhLFlBQVk7SUFjdkIsc0JBQW1CLElBQVM7UUFBVCxTQUFJLEdBQUosSUFBSSxDQUFLO1FBTHJCLFdBQU0sR0FBVyx5QkFBeUIsQ0FBQztRQUkxQyxvQkFBZSxHQUFXLHFCQUFxQixDQUFDO1FBRXRELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxh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Q0FBQyxDQUFDO2dCQUNuRSxLQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixDQUFDO1lBRUQsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO2dCQUNuQixJQUFJLEtBQUssR0FBdUIsS0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25FLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixDQUFDO1lBRUQsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQSxDQUFDO2dCQUNuQixJQUFJLEtBQUssR0FBdUIsS0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ25FLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLEtBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJ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SCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7UUFFZixrQkFBVSxDQUFDO1lBQ1QsSUFBSSxnQkFBZ0IsR0FBNEIsS0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUMxRixJQUFJLFNBQVMsR0FBNEIsS0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0UsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLFlBQVksR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNsRSxTQUFTLENBQUMsS0FBSyxHQUFHLFdBQVcsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUVsRCxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNWLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUE5YUQsSUE4YUM7QUE5YVksWUFBWTtJQUp4QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLG9CQUFvQjtLQUNsQyxDQUFDO3FDQWV3QixXQUFJO0dBZGpCLFlBQVksQ0E4YXhCO0FBOWFZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGNvbm5lY3QsU29ja2V0T3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtc29ja2V0LmlvXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCB7IExpc3RWaWV3IH0gZnJvbSBcInVpL2xpc3Qtdmlld1wiO1xuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcInVpL3RleHQtZmllbGRcIjtcbmltcG9ydCB7IFRhYlZpZXdJdGVtIH0gZnJvbSBcInVpL3RhYi12aWV3XCI7XG5pbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSAndGltZXInXG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gXCJhcHBsaWNhdGlvblwiO1xuaW1wb3J0ICogYXMgcGxhdGZvcm0gZnJvbSBcInBsYXRmb3JtXCI7XG5cbmltcG9ydCBkaWFsb2dzID0gcmVxdWlyZShcInVpL2RpYWxvZ3NcIik7XG5pbXBvcnQgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlXCIpO1xuXG5kZWNsYXJlIHZhciBOU0luZGV4UGF0aCxVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLHVuZXNjYXBlLGFuZHJvaWQ7XG5cbmNsYXNzIE1lc3NhZ2V7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdmF0YXI6c3RyaW5nLCBwdWJsaWMgcG93ZXI6c3RyaW5nLHB1YmxpYyBmcm9tOnN0cmluZyxwdWJsaWMgbWVzc2FnZTpzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBiYWNrZ3JvdW5kOnN0cmluZyxwdWJsaWMgY29sb3I6c3RyaW5nLHB1YmxpYyBtZXNzYWdlQ29sb3I6c3RyaW5nKXt9XG59XG5cbmNsYXNzIE5vdGlmaWNhdGlvbntcbiAgY29uc3RydWN0b3IocHVibGljIGltYWdlOnN0cmluZyxwdWJsaWMgbWVzc2FnZTpzdHJpbmcpe31cbn1cblxuZnVuY3Rpb24gX3VuZXNjYXBlKGNvZGU6c3RyaW5nKTogc3RyaW5ne1xuICByZXR1cm4gXy51bmVzY2FwZShjb2RlKS5yZXBsYWNlKC8mI3gzQzsvLCc8Jyk7XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJteS1hcHBcIixcbiAgdGVtcGxhdGVVcmw6ICdhcHAuY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCB7XG4gIHB1YmxpYyBtZXNzYWdlczogQXJyYXk8TWVzc2FnZT47XG4gIHB1YmxpYyBicm9hZGNhc3RzOiBBcnJheTxNZXNzYWdlPjtcbiAgcHVibGljIG5vdGlmaWNhdGlvbnM6IEFycmF5PE5vdGlmaWNhdGlvbj47XG4gIHB1YmxpYyB1c2VyczogQXJyYXk8YW55PjtcbiAgcHVibGljIHVzZXI6IGFueTtcbiAgcHVibGljIHJvb21zOiBBcnJheTxhbnk+O1xuICBwdWJsaWMgcm9vbTogYW55O1xuICBwdWJsaWMgcG93ZXJzOiBBcnJheTxhbnk+O1xuICBwdWJsaWMgc2VydmVyOiBzdHJpbmcgPSBcImh0dHA6Ly9raGFsZWVqY2hhdC5jb20vXCI7XG5cbiAgcHJpdmF0ZSBzb2NrZXQ7XG4gIHB1YmxpYyB1c2VyaWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBjb25uZWN0aW9uX25hbWU6IHN0cmluZyA9IFwiQW5kcm9pZCBBcHBsaWNhdGlvblwiO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFnZTpQYWdlKXtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5ub3RpZmljYXRpb25zID0gW107XG4gICAgdGhpcy51c2VycyA9IFtdO1xuICAgIHRoaXMucG93ZXJzID0gW107XG4gICAgdGhpcy5icm9hZGNhc3RzID0gW107XG4gICAgdGhpcy5yb29tcyA9IFtdO1xuICB9XG5cbiAgY29ubmVjdGlvbigpe1xuICAgIHZhciBzZXJ2ZXI6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwic2VydmVyaXBcIik7XG4gICAgdmFyIHVzZXJuYW1lOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInVzZXJuYW1lXCIpO1xuICAgIHZhciBwYXNzd29yZDpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJwYXNzd29yZFwiKTtcbiAgICB0aGlzLnNlcnZlciA9IHNlcnZlci50ZXh0O1xuICAgIFxuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB0aGlzLnVzZXJzID0gW107XG4gICAgdGhpcy5wb3dlcnMgPSBbXTtcbiAgICB0aGlzLmJyb2FkY2FzdHMgPSBbXTtcbiAgICB0aGlzLnJvb21zID0gW107IFxuXG4gICAgdGhpcy5zb2NrZXQgPSBjb25uZWN0KHRoaXMuc2VydmVyLCA8U29ja2V0T3B0aW9ucz4geyB0cmFuc3BvcnRzOiBbJ3BvbGxpbmcnLCAnd2Vic29ja2V0J10gfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYqtmFINin2YTYp9iq2LXYp9mEINio2YbYrNin2K0nKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcblxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbXNnJywge2NtZDogXCJsb2dpblwiICwgZGF0YTp7XG4gICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZS50ZXh0LFxuICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQudGV4dCxcbiAgICAgICAgc3RlYWx0aDogdHJ1ZSxcbiAgICAgICAgZnA6IHRoaXMuY29ubmVjdGlvbl9uYW1lLCBcbiAgICAgICAgcmVmcjogdGhpcy5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICByOiB0aGlzLmNvbm5lY3Rpb25fbmFtZVxuICAgICAgfX0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ21zZycsIChkYXRhKSA9PiB7XG4gICAgICBpZih0eXBlb2YgZGF0YS5kYXRhID09PSBcInN0cmluZ1wiICYmIGRhdGEuY21kICE9ICd1LScpe1xuICAgICAgICAgIGRhdGEuZGF0YSA9IEpTT04ucGFyc2UodW5lc2NhcGUoZGF0YS5kYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwibG9naW5cIil7IC8vIG9uIGxvZ2luIHRvIHNlcnZlclxuICAgICAgICBpZihkYXRhLmRhdGEubXNnID0gXCJva1wiKXtcbiAgICAgICAgICB0aGlzLnVzZXJpZCA9IGRhdGEuZGF0YS5pZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcIm1zZ1wiKXsgLy8gcm9vbSBtZXNzYWdlIFxuICAgICAgICB2YXIgbWVzc2FnZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RNZXNzYWdlc1wiKTtcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudWlkKVswXTtcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICBpZih1c2VyKSB7IFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2V9XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBpZihwb3dlcil7XG4gICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgIHNpY28gPSB0aGlzLnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLnVjb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS51Y29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goIG5ldyBNZXNzYWdlKHRoaXMuc2VydmVyICsgZGF0YS5kYXRhLnBpYywgc2ljbywgX3VuZXNjYXBlKGRhdGEuZGF0YS50b3BpYyksIF91bmVzY2FwZShkYXRhLmRhdGEubXNnLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGRhdGEuZGF0YS5iZywgZGF0YS5kYXRhLnVjb2wsIGRhdGEuZGF0YS5tY29sKSApO1xuICAgICAgICBtZXNzYWdlcy5yZWZyZXNoKCk7ICBcbiAgICAgICAgXG4gICAgICAgIGlmIChtZXNzYWdlcy5pb3MpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLmlvcy5zY3JvbGxUb1Jvd0F0SW5kZXhQYXRoQXRTY3JvbGxQb3NpdGlvbkFuaW1hdGVkKFxuICAgICAgICAgICAgICAgIE5TSW5kZXhQYXRoLmluZGV4UGF0aEZvckl0ZW1JblNlY3Rpb24odGhpcy5tZXNzYWdlcy5sZW5ndGgtMSwgMCksXG4gICAgICAgICAgICAgICAgVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbi5VSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uVG9wLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5zY3JvbGxUb0luZGV4KHRoaXMubWVzc2FnZXMubGVuZ3RoLTEpOyBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5jbWQgPT0gXCJub3RcIil7IC8vIG5vdGlmaWNhdGlvbnNcbiAgICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51c2VyKVswXSB8fCB7IHBpYzogXCJcIiB9O1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyKyB1c2VyLnBpYyxfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpKSk7XG4gICAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVsaXN0XCIpeyAvLyB1c2VycyBvbmxpbmVcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgICAgdmFyIHVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBlbGVtZW50LmlkKVswXTtcbiAgICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgaWYodXNlcikgeyBcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICAgIH1lbHNleyByZXR1cm4gZmFsc2U7fVxuICAgICAgICAgIH0pWzBdO1xuXG4gICAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgICAgc2ljbyA9IHRoaXMuc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgICAgZWxlbWVudC5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50LnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihlbGVtZW50Lm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgICAgZWxlbWVudC5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGVsZW1lbnQuYmcgICAgPSBlbGVtZW50LmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgICBlbGVtZW50LmJnICAgID0gZWxlbWVudC5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICAgIGVsZW1lbnQudWNvbCAgPSBlbGVtZW50LnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgICBlbGVtZW50LnVjb2wgID0gZWxlbWVudC51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgICAgZWxlbWVudC5tY29sICA9IGVsZW1lbnQubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICAgIGVsZW1lbnQubWNvbCAgPSBlbGVtZW50Lm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcblxuICAgICAgICAgIGVsZW1lbnQuc2ljbyAgPSBzaWNvO1xuXG4gICAgICAgICAgdGhpcy51c2Vycy5wdXNoKGVsZW1lbnQpOyAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInUtXCIpeyAvLyB1c2VyIGxlZnRcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnVzZXJzLnNwbGljZSh0aGlzLnVzZXJzLmluZGV4T2YodGhpcy51c2Vycy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YSlbMF0pLCAxKTtcbiAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1K1wiKXsgLy8gdXNlciBqb2luXG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy51c2Vycy5maWx0ZXIodmFsdWUgPT4gdmFsdWUuaWQgPT0gZGF0YS5kYXRhLmlkKVswXTtcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICBpZih1c2VyKSB7IFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2V9XG4gICAgICAgIH0pWzBdO1xuXG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEubWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcblxuICAgICAgICBkYXRhLmRhdGEuc2ljbyAgPSBzaWNvO1xuICAgICAgICB0aGlzLnVzZXJzLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1XlwiKXsgLy8gdXNlciBlZGl0XG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy51c2Vycy5zcGxpY2UodGhpcy51c2Vycy5pbmRleE9mKHRoaXMudXNlcnMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHRoaXMudXNlcnMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVyXCIpeyAvLyB1c2VyIGpvaW4gcm9vbVxuICAgICAgICBpZih0aGlzLnJvb21zID09IFtdIHx8IHRoaXMudXNlcnMgPT0gW10pe1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLnVzZXJzW3RoaXMudXNlcnMuaW5kZXhPZih0aGlzLnVzZXJzLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhWzBdKVswXSldO1xuICAgICAgICBpZiAodXNlciA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHVzZXIgPSB7XG4gICAgICAgICAgICByb29taWQ6ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVzZXIucm9vbWlkID0gZGF0YS5kYXRhWzFdO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInBvd2Vyc1wiKXsgLy8gcG93ZXJzXG4gICAgICAgIHRoaXMucG93ZXJzID0gZGF0YS5kYXRhO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTwgdGhpcy5wb3dlcnMubGVuZ3RoO2krKylcbiAgICAgICAge1xuICAgICAgICAgIHZhciBwbmFtZT0gdGhpcy5wb3dlcnNbaV0ubmFtZTtcbiAgICAgICAgICBpZihwbmFtZT09Jycpe3BuYW1lPSdfJzt9XG4gICAgICAgICAgdGhpcy5wb3dlcnNbcG5hbWVdID0gdGhpcy5wb3dlcnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gJ2JjJyl7IC8vIGJyb2FkY2FzdFxuICAgICAgICB2YXIgYnJvYWRjYXN0czpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdEJyb2FkY2FzdFwiKTtcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudWlkKVswXTtcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICBpZih1c2VyKSB7IFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2V9XG4gICAgICAgIH0pWzBdO1xuXG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0cy51bnNoaWZ0KCBuZXcgTWVzc2FnZSh0aGlzLnNlcnZlciArIGRhdGEuZGF0YS5waWMsIHNpY28sIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcbiAgICAgICAgYnJvYWRjYXN0cy5yZWZyZXNoKCk7ICBcbiAgICAgICAgXG4gICAgICAgIGlmIChicm9hZGNhc3RzLmlvcykge1xuICAgICAgICAgICAgYnJvYWRjYXN0cy5pb3Muc2Nyb2xsVG9Sb3dBdEluZGV4UGF0aEF0U2Nyb2xsUG9zaXRpb25BbmltYXRlZChcbiAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKDAsIDApLFxuICAgICAgICAgICAgICAgIFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24uVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvblRvcCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYnJvYWRjYXN0cy5zY3JvbGxUb0luZGV4KDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicmxpc3RcIil7IC8vIHJvb21zIGxpc3RcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIGVsZW1lbnQub25saW5lID0gMDtcbiAgICAgICAgICB0aGlzLnJvb21zLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicitcIil7IC8vIGFkZCByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnJvb21zLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInItXCIpeyAvLyByZW1vdmUgcm9vbVxuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5yb29tcy5zcGxpY2UodGhpcy5yb29tcy5pbmRleE9mKHRoaXMucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJyXlwiKXsgLy8gcm9vbSBlZGl0XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnJvb21zLnNwbGljZSh0aGlzLnJvb21zLmluZGV4T2YodGhpcy5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdGhpcy5yb29tcy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYp9mG2YLYt9i5INin2YTYp9iq2LXYp9mEJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3RfZXJyb3InLCAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2K7Yt9ijINmB2Yog2KfZhNin2KrYtdin2YQnKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTsgIFxuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X3RpbWVvdXQnLCAoZGF0YSkgPT4geyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINmE2Kcg2YrZhdmD2YbZhtmKINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdF9hdHRlbXB0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mG2Kcg2KfZgtmI2YUg2KjYp9i52KfYr9ipINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFINin2YTYp9mGJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYrdiv2Ksg2K7Yt9ijINmF2KcnKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICB9KTtcblxuICB9XG5cbiAgc2VuZEFkdmVydGlzaW5nKCl7XG4gICAgZGlhbG9ncy5wcm9tcHQoXCLYpdix2LPYp9mEINil2YfZhNin2YZcIiwgXCJcIikudGhlbihyID0+IHtcbiAgICAgICAgaWYoci5yZXN1bHQpeyAvLyBvbiBwcmVzcyBva1xuICAgICAgICAgIC8vIHNlbmQgQWR2ZXJ0aXNpbmdcbiAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIsIHtjbWQ6IFwicG1zZ1wiLCBkYXRhOiB7IG1zZzogci50ZXh0IH19KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25JdGVtVGFwKGV2dCl7XG4gICAgXG4gIH1cblxuICBqb2luUm9vbShldmVudCxyb29taWQpeyAvLyBqb2luIHJvb21cbiAgICAvLyBqb2luIHJvb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb20gaWRcbiAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcInJqb2luXCIsIGRhdGE6IHtpZDogdGhpcy5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IHJvb21pZClbMF0uaWQgfSB9KTtcbiAgfTtcblxuICBzZW5kTWVzc2FnZSgpeyAvLyBzZW5kIG1lc3NhZ2UgdG8gdXNlciByb29tXG4gICAgLy8gZ2V0IG1lc3NhZ2UgaW5wdXRcbiAgICB2YXIgdGV4dGZpZWxkOlRleHRGaWVsZD0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibWVzc2FnZWlucHV0XCIpO1xuICAgIC8vIHdoZW4gdGV4dGZpZWxkIGlzIGJsYW5rIGRvbnQgc2VuZCBhbnl0aGluZ1xuICAgIGlmKHRleHRmaWVsZC50ZXh0LnRyaW0oKSA9PSBcIlwiKSByZXR1cm47XG4gICAgLy8gc2VuZCBtZXNzYWdlXG4gICAgdGhpcy5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJtc2dcIiwgZGF0YToge21zZzogdGV4dGZpZWxkLnRleHR9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzZW5kQnJvYWRjYXN0KCl7IC8vIHNlbmQgYnJvYWRzY2FzdFxuICAgIC8vZ2V0IGJyb2FkY2FzdCBpbnB1dFxuICAgIHZhciB0ZXh0ZmllbGQ6VGV4dEZpZWxkPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJicm9hZGNhc3RpbnB1dFwiKTtcbiAgICAvLyB3aGVuIHRleHRmaWVsZCBpcyBibGFuayBkb250IHNlbmQgYW55dGhpbmdcbiAgICBpZih0ZXh0ZmllbGQudGV4dC50cmltKCkgPT0gXCJcIikgcmV0dXJuO1xuICAgIC8vIHNlbmQgYnJvYWRjYXN0XG4gICAgdGhpcy5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJiY1wiLCBkYXRhOiB7IG1zZzogdGV4dGZpZWxkLnRleHQsIGxpbms6IG51bGwgfSB9KTtcbiAgICAvLyBzZXQgdGV4dGZpZWxkIGJsYW5rXG4gICAgdGV4dGZpZWxkLnRleHQgPSBcIlwiO1xuICB9XG5cbiAgc2VuZEluZm8oKXtcbiAgICAvLyB0aGlzLnVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcigodmFsdWUsaW5kZXgpID0+IHZhbHVlLmlkID09IHRoaXMudXNlcmlkKVswXTtcbiAgICAvLyB0aGlzLnJvb20gPSB0aGlzLnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gdGhpcy51c2VyLnJvb21pZClbMF07XG4gICAgLy9cbiAgICAvLyBhbGVydChKU09OLnN0cmluZ2lmeSh0aGlzLnVzZXIsbnVsbCw0KSArIFwiXFxuXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnJvb20sbnVsbCw0KSk7XG4gIH1cblxuICB1cGRhdGVSb29tcyAocm9vbXM/Okxpc3RWaWV3KXsgLy8gcmVmcmVzaCByb29tIG9ubGluZSB1c2Vyc1xuICAgIGlmKHJvb21zID09IG51bGwpe1xuICAgICAgcm9vbXMgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTsgICAgICBcbiAgICB9XG5cbiAgICB0aGlzLnJvb21zLnNvcnQoKGEsIGIpID0+IGIub25saW5lIC0gYS5vbmxpbmUgKTtcblxuICAgIHRoaXMucm9vbXMuZm9yRWFjaCgoZWxlbWVudCxpbmRleCk9PntcbiAgICAgIHZhciB1c2Vyc1Jvb20gPSB0aGlzLnVzZXJzLmZpbHRlcih2ID0+IHYucm9vbWlkID09IGVsZW1lbnQuaWQpO1xuICAgICAgdGhpcy5yb29tc1tpbmRleF0ub25saW5lID0gdXNlcnNSb29tLmxlbmd0aDtcbiAgICB9KTtcblxuICAgIHJvb21zLnJlZnJlc2goKVxuICAgIFxuICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgIHZhciB0YWJOb3RpZmljYXRpb25zOlRhYlZpZXdJdGVtID0gPFRhYlZpZXdJdGVtPnRoaXMucGFnZS5nZXRWaWV3QnlJZChcInRhYk5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB2YXIgdGFiT25saW5lOlRhYlZpZXdJdGVtID0gPFRhYlZpZXdJdGVtPnRoaXMucGFnZS5nZXRWaWV3QnlJZChcInRhYk9ubGluZXNcIik7XG4gICAgICB0YWJOb3RpZmljYXRpb25zLnRpdGxlID0gXCLYp9mE2KPYtNi52KfYsdin2KogXCIgKyB0aGlzLm5vdGlmaWNhdGlvbnMubGVuZ3RoO1xuICAgICAgdGFiT25saW5lLnRpdGxlID0gXCLYp9mE2YXYqti12YTZitmGIFwiICsgdGhpcy51c2Vycy5sZW5ndGg7XG5cbiAgICAgIHRoaXMudXBkYXRlUm9vbXMocm9vbXMpO1xuICAgIH0sMTAwMCk7XG4gIH1cbn0iXX0=