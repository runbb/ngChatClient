"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var nativescript_socket_io_1 = require("nativescript-socket.io");
var page_1 = require("ui/page");
var timer_1 = require("timer");
var connection_1 = require("./services/connection");
var dialogs = require("ui/dialogs");
var _ = require("underscore");
var Message = (function () {
    function Message(id, avatar, power, dr3, from, message, background, color, messageColor) {
        this.id = id;
        this.avatar = avatar;
        this.power = power;
        this.dr3 = dr3;
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
var MainComponent = (function () {
    function MainComponent(page, connect, router) {
        this.page = page;
        this.connect = connect;
        this.router = router;
        this.connect.messages = [];
        this.connect.notifications = [];
        this.connect.users = [];
        this.connect.powers = [];
        this.connect.broadcasts = [];
        this.connect.rooms = [];
        this.connect.connected.next(false);
    }
    MainComponent.prototype.connection = function () {
        var _this = this;
        this.connect.connected.next(false);
        var server = this.page.getViewById("serverip");
        var username = this.page.getViewById("username");
        var password = this.page.getViewById("password");
        this.connect.server = server.text;
        this.connect.socket = nativescript_socket_io_1.connect(this.connect.server, { transports: ['polling', 'websocket'] });
        this.connect.socket.on('connect', function () {
            _this.connect.connected.next(true);
            var notifications = _this.page.getViewById("listNotifications");
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'تم الاتصال بنجاح'));
            notifications.refresh();
            _this.connect.socket.emit('msg', { cmd: "login", data: {
                    username: username.text,
                    password: password.text,
                    stealth: true,
                    fp: _this.connect.connection_name,
                    refr: _this.connect.connection_name,
                    r: _this.connect.connection_name
                } });
        });
        this.connect.socket.on('msg', function (data) {
            _this.connect.connected.next(true);
            if (typeof data.data === "string" && data.cmd != 'u-') {
                data.data = JSON.parse(unescape(data.data));
            }
            if (data.cmd == "login") {
                if (data.data.msg = "ok") {
                    _this.connect.userid = data.data.id;
                }
            }
            if (data.cmd == "msg") {
                var messages = _this.page.getViewById("listMessages");
                var sico = '';
                var user = _this.connect.users.filter(function (value) { return value.id == data.data.uid; })[0];
                var power = _this.connect.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.connect.server + "sico/" + power.ico;
                    }
                }
                data.data.ico = (user || { ico: '' }).ico || '';
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
                if (_this.connect.messages.length > 100) {
                    _this.connect.messages.shift();
                }
                _this.connect.messages.push(new Message((user || { id: "" }).id, _this.connect.server + data.data.pic, sico, data.data.ico != '' ? _this.connect.server + "dro3/" + data.data.ico : '', _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
                messages.refresh();
                if (messages.ios) {
                    messages.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(_this.connect.messages.length - 1, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                }
                else {
                    messages.scrollToIndex(_this.connect.messages.length - 1);
                }
            }
            if (data.cmd == "not") {
                var notifications = _this.page.getViewById("listNotifications");
                var user = _this.connect.users.filter(function (value) { return value.id == data.data.user; })[0] || { pic: "" };
                _this.connect.notifications.unshift(new Notification(_this.connect.server + user.pic, _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
                notifications.refresh();
            }
            if (data.cmd == "ulist") {
                var onlines = _this.page.getViewById("listOnline");
                data.data.forEach(function (element) {
                    var sico = '';
                    var power = _this.connect.powers.filter(function (value) {
                        return value.name == element.power;
                    })[0];
                    if (power) {
                        if (power.ico != '') {
                            sico = _this.connect.server + "sico/" + power.ico;
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
                    element.ico = (element || { ico: '' }).ico || '';
                    element.bg = element.bg || '#FFFFFF';
                    element.bg = element.bg.replace(/\/|\\/, '');
                    element.ucol = element.ucol || '#000000';
                    element.ucol = element.ucol.replace(/\/|\\/, '');
                    element.mcol = element.mcol || '#000000';
                    element.mcol = element.mcol.replace(/\/|\\/, '');
                    element.sico = sico;
                    data.data.dico = data.data.ico != '' ? _this.connect.server + "dro3/" + data.data.ico : '';
                    _this.connect.users.push(element);
                });
                onlines.refresh();
                _this.updateUsers(onlines);
            }
            if (data.cmd == "u-") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.users.splice(_this.connect.users.indexOf(_this.connect.users.filter(function (v) { return v.id == data.data; })[0]), 1);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "u+") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                var sico = '';
                var power = _this.connect.powers.filter(function (value) {
                    return value.name == data.data.power;
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.connect.server + "sico/" + power.ico;
                    }
                }
                data.data.ico = (data.data || { ico: '' }).ico || '';
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
                data.data.dico = data.data.ico != '' ? _this.connect.server + "dro3/" + data.data.ico : '';
                data.data.sico = sico;
                _this.connect.users.push(data.data);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "u^") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.users.splice(_this.connect.users.indexOf(_this.connect.users.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                var sico = '';
                var power = _this.connect.powers.filter(function (value) {
                    return value.name == data.data.power;
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.connect.server + "sico/" + power.ico;
                    }
                }
                data.data.ico = (data.data || { ico: '' }).ico || '';
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
                data.data.dico = data.data.ico != '' ? _this.connect.server + "dro3/" + data.data.ico : '';
                data.data.sico = sico;
                _this.connect.users.push(data.data);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "ur") {
                if (_this.connect.rooms == [] || _this.connect.users == []) {
                    return;
                }
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                var user = _this.connect.users[_this.connect.users.indexOf(_this.connect.users.filter(function (v) { return v.id == data.data[0]; })[0])];
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
                _this.connect.powers = data.data;
                for (var i = 0; i < _this.connect.powers.length; i++) {
                    var pname = _this.connect.powers[i].name;
                    if (pname == '') {
                        pname = '_';
                    }
                    _this.connect.powers[pname] = _this.connect.powers[i];
                }
            }
            if (data.cmd == 'bc') {
                var broadcasts = _this.page.getViewById("listBroadcast");
                var sico = '';
                var user = _this.connect.users.filter(function (value) { return value.id == data.data.uid; })[0];
                var power = _this.connect.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.connect.server + "sico/" + power.ico;
                    }
                }
                data.data.ico = (user || { ico: '' }).ico || '';
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
                if (_this.connect.broadcasts.length > 100) {
                    _this.connect.broadcasts.pop();
                }
                _this.connect.broadcasts.unshift(new Message((user || { id: "" }).id, _this.connect.server + data.data.pic, sico, data.data.ico != '' ? _this.connect.server + "dro3/" + data.data.ico : '', _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
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
                    _this.connect.rooms.push(element);
                });
                rooms.refresh();
                _this.updateRooms();
            }
            if (data.cmd == "r+") {
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.rooms.push(data.data);
                rooms.refresh();
            }
            if (data.cmd == "r-") {
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.rooms.splice(_this.connect.rooms.indexOf(_this.connect.rooms.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                rooms.refresh();
            }
            if (data.cmd == "r^") {
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.rooms.splice(_this.connect.rooms.indexOf(_this.connect.rooms.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                _this.connect.rooms.push(data.data);
                rooms.refresh();
            }
        });
        this.connect.socket.on('disconnect', function (data) {
            _this.connect.connected.next(false);
            _this.connect.messages = [];
            _this.connect.users = [];
            _this.connect.powers = [];
            _this.connect.broadcasts = [];
            _this.connect.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'اوه لا !! انقطع الاتصال'));
            notifications.refresh();
        });
        this.connect.socket.on('connect_error', function (data) {
            _this.connect.connected.next(false);
            _this.connect.messages = [];
            _this.connect.users = [];
            _this.connect.powers = [];
            _this.connect.broadcasts = [];
            _this.connect.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'اوه لا !! خطأ في الاتصال'));
            notifications.refresh();
        });
        this.connect.socket.on('connect_timeout', function (data) {
            _this.connect.connected.next(false);
            _this.connect.messages = [];
            _this.connect.users = [];
            _this.connect.powers = [];
            _this.connect.broadcasts = [];
            _this.connect.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'اوه لا !! لا يمكنني الاتصال بالخادم'));
            notifications.refresh();
        });
        this.connect.socket.on('reconnect_attempt', function (data) {
            _this.connect.connected.next(false);
            _this.connect.messages = [];
            _this.connect.users = [];
            _this.connect.powers = [];
            _this.connect.broadcasts = [];
            _this.connect.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'انا اقوم باعادة الاتصال بالخادم الان'));
            notifications.refresh();
        });
        this.connect.socket.on('error', function (data) {
            _this.connect.connected.next(false);
            _this.connect.messages = [];
            _this.connect.users = [];
            _this.connect.powers = [];
            _this.connect.broadcasts = [];
            _this.connect.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'اوه لا !! حدث خطأ ما'));
            notifications.refresh();
        });
    };
    MainComponent.prototype.sendAdvertising = function () {
        var _this = this;
        dialogs.prompt({
            title: "ارسال الاعلان",
            cancelable: true,
            message: "ادخل نص الاعلان",
            cancelButtonText: "الغاء",
            okButtonText: "ارسال"
        }).then(function (r) {
            if (r.result) {
                // send Advertising
                _this.connect.socket.emit("msg", { cmd: "pmsg", data: { msg: r.text } });
            }
        });
    };
    MainComponent.prototype.onItemTap = function (evt) {
    };
    MainComponent.prototype.joinRoom = function (event, roomid) {
        // join room                                room id
        this.connect.socket.emit("msg", { cmd: "rjoin", data: { id: this.connect.rooms.filter(function (v) { return v.id == roomid; })[0].id } });
    };
    ;
    MainComponent.prototype.sendMessage = function () {
        // get message input
        var textfield = this.page.getViewById("messageinput");
        // when textfield is blank dont send anything
        if (textfield.text.trim() == "")
            return;
        // send message
        this.connect.socket.emit("msg", { cmd: "msg", data: { msg: textfield.text } });
        // set textfield blank
        textfield.text = "";
    };
    MainComponent.prototype.sendBroadcast = function () {
        //get broadcast input
        var textfield = this.page.getViewById("broadcastinput");
        // when textfield is blank dont send anything
        if (textfield.text.trim() == "")
            return;
        // send broadcast
        this.connect.socket.emit("msg", { cmd: "bc", data: { msg: textfield.text, link: null } });
        // set textfield blank
        textfield.text = "";
    };
    MainComponent.prototype.showInfo = function (id) {
        if (typeof id != "string") {
            alert(JSON.stringify(this.connect.user, null, 4) + "\n" + JSON.stringify(this.connect.room, null, 4));
        }
        else {
            var user = this.connect.users.filter(function (v) { return v.id == id; })[0];
            var room = this.connect.rooms.filter(function (v) { return v.id == user.roomid; })[0];
            if (user == undefined) {
                dialogs.alert({
                    title: "تنبيه",
                    message: "العضو غير موجود الان"
                });
            }
            alert(JSON.stringify(user, null, 4) +
                "\n" +
                JSON.stringify(room, null, 4));
        }
    };
    MainComponent.prototype.updateRooms = function (rooms) {
        var _this = this;
        if (rooms == null) {
            rooms = this.page.getViewById("listRooms");
        }
        this.connect.rooms.sort(function (a, b) { return b.online - a.online; });
        this.connect.rooms.forEach(function (element, index) {
            var usersRoom = _this.connect.users.filter(function (v) { return v.roomid == element.id; });
            _this.connect.rooms[index].online = usersRoom.length;
        });
        rooms.refresh();
        timer_1.setTimeout(function () {
            _this.updateRooms(rooms);
        }, 1000);
    };
    MainComponent.prototype.updateUsers = function (users) {
        var _this = this;
        if (users == null) {
            users = this.page.getViewById("listOnline");
        }
        this.connect.user = this.connect.users.filter(function (value, index) { return value.id == _this.connect.userid; })[0];
        this.connect.room = this.connect.rooms.filter(function (v) { return v.id == _this.connect.user; })[0];
        this.connect.users.sort(function (a, b) {
            if (b.rep == undefined || b.rep == undefined) {
                return;
            }
            return b.rep - a.rep;
        });
        this.connect.users.forEach(function (element, index) {
            var sico = '';
            var power = _this.connect.powers.filter(function (value) {
                return value.name == _this.connect.users[index].power;
            })[0];
            if (power) {
                if (power.ico != '') {
                    sico = _this.connect.server + "sico/" + power.ico;
                }
            }
            _this.connect.users[index].ico = (_this.connect.users[index] || { ico: '' }).ico || '';
            _this.connect.users[index].dico = _this.connect.users[index].ico != '' ? _this.connect.server + "dro3/" + _this.connect.users[index].ico : '';
            _this.connect.users[index].sico = sico;
        });
        users.refresh();
        timer_1.setTimeout(function () {
            _this.updateUsers(users);
        }, 1000);
    };
    MainComponent.prototype.showPrivate = function () {
        this.router.navigate(['private']);
    };
    return MainComponent;
}());
MainComponent = __decorate([
    core_1.Component({
        selector: "my-app",
        templateUrl: 'main.component.html'
    }),
    __metadata("design:paramtypes", [page_1.Page, connection_1.Connection, router_1.Router])
], MainComponent);
exports.MainComponent = MainComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYWluLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUEwQztBQUMxQywwQ0FBeUM7QUFDekMsaUVBQStEO0FBQy9ELGdDQUErQjtBQUkvQiwrQkFBa0M7QUFHbEMsb0RBQW1EO0FBS25ELG9DQUF1QztBQUN2Qyw4QkFBaUM7QUFJakM7SUFDRSxpQkFBbUIsRUFBUyxFQUFTLE1BQWEsRUFBUyxLQUFZLEVBQVEsR0FBVSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQy9HLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFFBQUcsR0FBSCxHQUFHLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztRQUMvRyxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLGlCQUFZLEdBQVosWUFBWSxDQUFPO0lBQUUsQ0FBQztJQUN4RixjQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUNFLHNCQUFtQixLQUFZLEVBQVEsT0FBYztRQUFsQyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFFLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUVELG1CQUFtQixJQUFXO0lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQU1ELElBQWEsYUFBYTtJQUN4Qix1QkFBbUIsSUFBUyxFQUFVLE9BQWtCLEVBQVMsTUFBYTtRQUEzRCxTQUFJLEdBQUos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LENBQUMsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSyxTQUFTLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLFNBQVMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBQyxFQUFFLENBQUMsQ0FBQztnQkFHckQsRUFBRSxDQUFBLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFBLENBQUM7b0JBQ3JDLEtBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQyxDQUFDO2dCQUVELEtBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksRUFBRSxHQUFHLEtBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxp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b0JBQUM7QUFBRCxDQUFDLEFBdGpCRCxJQXNqQkM7QUF0akJZLGFBQWE7SUFKekIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxxQkFBcUI7S0FDbkMsQ0FBQztxQ0FFd0IsV0FBSSxFQUFrQix1QkFBVSxFQUFnQixlQUFNO0dBRG5FLGFBQWEsQ0FzakJ6QjtBQXRqQlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgTGlzdFZpZXcgfSBmcm9tIFwidWkvbGlzdC12aWV3XCI7XG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwidWkvdGV4dC1maWVsZFwiO1xuaW1wb3J0IHsgVGFiVmlld0l0ZW0gfSBmcm9tIFwidWkvdGFiLXZpZXdcIjtcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0aW1lcidcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL3NlcnZpY2VzL2Nvbm5lY3Rpb25cIjtcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcImFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tIFwicGxhdGZvcm1cIjtcblxuaW1wb3J0IGRpYWxvZ3MgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcbmltcG9ydCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmVcIik7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5mdW5jdGlvbiBfdW5lc2NhcGUoY29kZTpzdHJpbmcpOiBzdHJpbmd7XG4gIHJldHVybiBfLnVuZXNjYXBlKGNvZGUpLnJlcGxhY2UoLyYjeDNDOy8sJzwnKTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICB0ZW1wbGF0ZVVybDogJ21haW4uY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIE1haW5Db21wb25lbnR7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYWdlOlBhZ2UsIHByaXZhdGUgY29ubmVjdDpDb25uZWN0aW9uLCBwdWJsaWMgcm91dGVyOlJvdXRlcil7XG4gICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuXG4gIH1cblxuICBjb25uZWN0aW9uKCl7XG4gICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICB2YXIgc2VydmVyOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInNlcnZlcmlwXCIpO1xuICAgIHZhciB1c2VybmFtZTpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJ1c2VybmFtZVwiKTtcbiAgICB2YXIgcGFzc3dvcmQ6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwicGFzc3dvcmRcIik7XG4gICAgdGhpcy5jb25uZWN0LnNlcnZlciA9IHNlcnZlci50ZXh0O1xuXG4gICAgdGhpcy5jb25uZWN0LnNvY2tldCA9IGNvbm5lY3QodGhpcy5jb25uZWN0LnNlcnZlciwgPFNvY2tldE9wdGlvbnM+IHsgdHJhbnNwb3J0czogWydwb2xsaW5nJywgJ3dlYnNvY2tldCddIH0pO1xuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQodHJ1ZSk7XG5cbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLmNvbm5lY3Quc2VydmVyICsgJ3BpYy5wbmcnLCfYqtmFINin2YTYp9iq2LXYp9mEINio2YbYrNin2K0nKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcblxuICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiBcImxvZ2luXCIgLCBkYXRhOntcbiAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLnRleHQsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZC50ZXh0LFxuICAgICAgICBzdGVhbHRoOiB0cnVlLFxuICAgICAgICBmcDogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgIHJlZnI6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICByOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lXG4gICAgICB9fSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdtc2cnLCAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KHRydWUpO1xuXG4gICAgICBpZih0eXBlb2YgZGF0YS5kYXRhID09PSBcInN0cmluZ1wiICYmIGRhdGEuY21kICE9ICd1LScpe1xuICAgICAgICAgIGRhdGEuZGF0YSA9IEpTT04ucGFyc2UodW5lc2NhcGUoZGF0YS5kYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwibG9naW5cIil7IC8vIG9uIGxvZ2luIHRvIHNlcnZlclxuICAgICAgICBpZihkYXRhLmRhdGEubXNnID0gXCJva1wiKXtcbiAgICAgICAgICB0aGlzLmNvbm5lY3QudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwibXNnXCIpeyAvLyByb29tIG1lc3NhZ2UgXG4gICAgICAgIHZhciBtZXNzYWdlczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE1lc3NhZ2VzXCIpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodmFsdWUgPT4gdmFsdWUuaWQgPT0gZGF0YS5kYXRhLnVpZClbMF07XG4gICAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICBpZih1c2VyKSB7IFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2V9XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBpZihwb3dlcil7XG4gICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgIHNpY28gPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhLmljbyA9ICh1c2VyIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuY29ubmVjdC5tZXNzYWdlcy5sZW5ndGggPiAxMDApe1xuICAgICAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzLnB1c2goIG5ldyBNZXNzYWdlKCh1c2VyIHx8IHtpZDogXCJcIn0pLmlkICx0aGlzLmNvbm5lY3Quc2VydmVyICsgZGF0YS5kYXRhLnBpYywgc2ljbywgZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJycsIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcbiAgICAgICAgbWVzc2FnZXMucmVmcmVzaCgpOyAgXG4gICAgICAgIFxuICAgICAgICBpZiAobWVzc2FnZXMuaW9zKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5pb3Muc2Nyb2xsVG9Sb3dBdEluZGV4UGF0aEF0U2Nyb2xsUG9zaXRpb25BbmltYXRlZChcbiAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKHRoaXMuY29ubmVjdC5tZXNzYWdlcy5sZW5ndGgtMSwgMCksXG4gICAgICAgICAgICAgICAgVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbi5VSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uVG9wLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5zY3JvbGxUb0luZGV4KHRoaXMuY29ubmVjdC5tZXNzYWdlcy5sZW5ndGgtMSk7IFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmNtZCA9PSBcIm5vdFwiKXsgLy8gbm90aWZpY2F0aW9uc1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudXNlcilbMF0gfHwgeyBwaWM6IFwiXCIgfTtcbiAgICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyB1c2VyLnBpYyxfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpKSk7XG4gICAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVsaXN0XCIpeyAvLyB1c2VycyBvbmxpbmVcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSBlbGVtZW50LnBvd2VyO1xuICAgICAgICAgIH0pWzBdO1xuXG4gICAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgICAgc2ljbyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWxlbWVudC5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50LmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWxlbWVudC51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICAgIGVsZW1lbnQudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50Lm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgZWxlbWVudC5pY28gPSAoZWxlbWVudCB8fCB7aWNvOicnfSkuaWNvIHx8ICcnO1xuXG4gICAgICAgICAgZWxlbWVudC5iZyAgICA9IGVsZW1lbnQuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICAgIGVsZW1lbnQuYmcgICAgPSBlbGVtZW50LmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgICAgZWxlbWVudC51Y29sICA9IGVsZW1lbnQudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICAgIGVsZW1lbnQudWNvbCAgPSBlbGVtZW50LnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgICBlbGVtZW50Lm1jb2wgID0gZWxlbWVudC5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgICAgZWxlbWVudC5tY29sICA9IGVsZW1lbnQubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuXG4gICAgICAgICAgZWxlbWVudC5zaWNvICA9IHNpY287XG5cbiAgICAgICAgICBkYXRhLmRhdGEuZGljbyA9IGRhdGEuZGF0YS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnO1xuXG4gICAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJzLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMudXBkYXRlVXNlcnMob25saW5lcyk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidS1cIil7IC8vIHVzZXIgbGVmdFxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHRoaXMuY29ubmVjdC51c2Vycy5zcGxpY2UodGhpcy5jb25uZWN0LnVzZXJzLmluZGV4T2YodGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhKVswXSksIDEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInUrXCIpeyAvLyB1c2VyIGpvaW5cbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gZGF0YS5kYXRhLnBvd2VyO1xuICAgICAgICB9KVswXTtcblxuICAgICAgICBpZihwb3dlcil7XG4gICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgIHNpY28gPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGF0YS5pY28gPSAoZGF0YS5kYXRhIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEubWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcblxuICAgICAgICBkYXRhLmRhdGEuZGljbyA9IGRhdGEuZGF0YS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnO1xuXG4gICAgICAgIGRhdGEuZGF0YS5zaWNvICA9IHNpY287XG4gICAgICAgIHRoaXMuY29ubmVjdC51c2Vycy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidV5cIil7IC8vIHVzZXIgZWRpdFxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHRoaXMuY29ubmVjdC51c2Vycy5zcGxpY2UodGhpcy5jb25uZWN0LnVzZXJzLmluZGV4T2YodGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhLmlkKVswXSksIDEpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLmNvbm5lY3QucG93ZXJzLmZpbHRlcih2YWx1ZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSBkYXRhLmRhdGEucG93ZXI7XG4gICAgICAgIH0pWzBdO1xuXG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmljbyA9IChkYXRhLmRhdGEgfHwge2ljbzonJ30pLmljbyB8fCAnJzsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuXG4gICAgICAgIGRhdGEuZGF0YS5kaWNvID0gZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJyc7XG5cbiAgICAgICAgZGF0YS5kYXRhLnNpY28gID0gc2ljbztcblxuICAgICAgICB0aGlzLmNvbm5lY3QudXNlcnMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVyXCIpeyAvLyB1c2VyIGpvaW4gcm9vbVxuICAgICAgICBpZih0aGlzLmNvbm5lY3Qucm9vbXMgPT0gW10gfHwgdGhpcy5jb25uZWN0LnVzZXJzID09IFtdKXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzW3RoaXMuY29ubmVjdC51c2Vycy5pbmRleE9mKHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YVswXSlbMF0pXTtcbiAgICAgICAgaWYgKHVzZXIgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICB1c2VyID0ge1xuICAgICAgICAgICAgcm9vbWlkOiAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1c2VyLnJvb21pZCA9IGRhdGEuZGF0YVsxXTtcbiAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJwb3dlcnNcIil7IC8vIHBvd2Vyc1xuICAgICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gZGF0YS5kYXRhO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTwgdGhpcy5jb25uZWN0LnBvd2Vycy5sZW5ndGg7aSsrKVxuICAgICAgICB7XG4gICAgICAgICAgdmFyIHBuYW1lPSB0aGlzLmNvbm5lY3QucG93ZXJzW2ldLm5hbWU7XG4gICAgICAgICAgaWYocG5hbWU9PScnKXtcbiAgICAgICAgICAgICAgcG5hbWU9J18nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnNbcG5hbWVdID0gdGhpcy5jb25uZWN0LnBvd2Vyc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSAnYmMnKXsgLy8gYnJvYWRjYXN0XG4gICAgICAgIHZhciBicm9hZGNhc3RzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0QnJvYWRjYXN0XCIpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodmFsdWUgPT4gdmFsdWUuaWQgPT0gZGF0YS5kYXRhLnVpZClbMF07XG4gICAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICBpZih1c2VyKSB7IFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2V9XG4gICAgICAgIH0pWzBdO1xuXG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmljbyA9ICh1c2VyIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYodGhpcy5jb25uZWN0LmJyb2FkY2FzdHMubGVuZ3RoID4gMTAwKXtcbiAgICAgICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cy5wb3AoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzLnVuc2hpZnQoIG5ldyBNZXNzYWdlKCh1c2VyIHx8IHtpZDogXCJcIn0pLmlkICwgdGhpcy5jb25uZWN0LnNlcnZlciArIGRhdGEuZGF0YS5waWMsIHNpY28sIGRhdGEuZGF0YS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnLCBfdW5lc2NhcGUoZGF0YS5kYXRhLnRvcGljKSwgX3VuZXNjYXBlKGRhdGEuZGF0YS5tc2cucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZGF0YS5kYXRhLmJnLCBkYXRhLmRhdGEudWNvbCwgZGF0YS5kYXRhLm1jb2wpICk7XG4gICAgICAgIGJyb2FkY2FzdHMucmVmcmVzaCgpOyAgXG4gICAgICAgIFxuICAgICAgICBpZiAoYnJvYWRjYXN0cy5pb3MpIHtcbiAgICAgICAgICAgIGJyb2FkY2FzdHMuaW9zLnNjcm9sbFRvUm93QXRJbmRleFBhdGhBdFNjcm9sbFBvc2l0aW9uQW5pbWF0ZWQoXG4gICAgICAgICAgICAgICAgTlNJbmRleFBhdGguaW5kZXhQYXRoRm9ySXRlbUluU2VjdGlvbigwLCAwKSxcbiAgICAgICAgICAgICAgICBVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLlVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb25Ub3AsXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyb2FkY2FzdHMuc2Nyb2xsVG9JbmRleCgwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInJsaXN0XCIpeyAvLyByb29tcyBsaXN0XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICBlbGVtZW50Lm9ubGluZSA9IDA7XG4gICAgICAgICAgdGhpcy5jb25uZWN0LnJvb21zLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicitcIil7IC8vIGFkZCByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwici1cIil7IC8vIHJlbW92ZSByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMuc3BsaWNlKHRoaXMuY29ubmVjdC5yb29tcy5pbmRleE9mKHRoaXMuY29ubmVjdC5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInJeXCIpeyAvLyByb29tIGVkaXRcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHRoaXMuY29ubmVjdC5yb29tcy5zcGxpY2UodGhpcy5jb25uZWN0LnJvb21zLmluZGV4T2YodGhpcy5jb25uZWN0LnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhLmlkKVswXSksIDEpO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG4gICAgICBcbiAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINin2YbZgti32Lkg2KfZhNin2KrYtdin2YQnKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG5cbiAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINiu2LfYoyDZgdmKINin2YTYp9iq2LXYp9mEJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7ICBcbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdjb25uZWN0X3RpbWVvdXQnLCAoZGF0YSkgPT4geyBcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG5cbiAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINmE2Kcg2YrZhdmD2YbZhtmKINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5vbigncmVjb25uZWN0X2F0dGVtcHQnLCAoZGF0YSkgPT4geyBcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG5cbiAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YbYpyDYp9mC2YjZhSDYqNin2LnYp9iv2Kkg2KfZhNin2KrYtdin2YQg2KjYp9mE2K7Yp9iv2YUg2KfZhNin2YYnKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdlcnJvcicsIChkYXRhKSA9PiB7IFxuICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcblxuICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2K3Yr9irINiu2LfYoyDZhdinJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIHNlbmRBZHZlcnRpc2luZygpe1xuICAgIGRpYWxvZ3MucHJvbXB0KHtcbiAgICAgIHRpdGxlOiBcItin2LHYs9in2YQg2KfZhNin2LnZhNin2YZcIixcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBtZXNzYWdlOiBcItin2K/YrtmEINmG2LUg2KfZhNin2LnZhNin2YZcIixcbiAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IFwi2KfZhNi62KfYoVwiLFxuICAgICAgb2tCdXR0b25UZXh0OiBcItin2LHYs9in2YRcIlxuICAgIH0pLnRoZW4ociA9PiB7XG4gICAgICAgIGlmKHIucmVzdWx0KXsgLy8gb24gcHJlc3Mgb2tcbiAgICAgICAgICAvLyBzZW5kIEFkdmVydGlzaW5nXG4gICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KFwibXNnXCIsIHtjbWQ6IFwicG1zZ1wiLCBkYXRhOiB7IG1zZzogci50ZXh0IH19KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25JdGVtVGFwKGV2dCl7XG4gICAgXG4gIH1cblxuICBqb2luUm9vbShldmVudCxyb29taWQpeyAvLyBqb2luIHJvb21cbiAgICAvLyBqb2luIHJvb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb20gaWRcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmVtaXQoXCJtc2dcIix7Y21kOlwicmpvaW5cIiwgZGF0YToge2lkOiB0aGlzLmNvbm5lY3Qucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSByb29taWQpWzBdLmlkIH0gfSk7XG4gIH07XG5cbiAgc2VuZE1lc3NhZ2UoKXsgLy8gc2VuZCBtZXNzYWdlIHRvIHVzZXIgcm9vbVxuICAgIC8vIGdldCBtZXNzYWdlIGlucHV0XG4gICAgdmFyIHRleHRmaWVsZDpUZXh0RmllbGQ9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcIm1lc3NhZ2VpbnB1dFwiKTtcbiAgICAvLyB3aGVuIHRleHRmaWVsZCBpcyBibGFuayBkb250IHNlbmQgYW55dGhpbmdcbiAgICBpZih0ZXh0ZmllbGQudGV4dC50cmltKCkgPT0gXCJcIikgcmV0dXJuO1xuICAgIC8vIHNlbmQgbWVzc2FnZVxuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJtc2dcIiwgZGF0YToge21zZzogdGV4dGZpZWxkLnRleHR9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzZW5kQnJvYWRjYXN0KCl7IC8vIHNlbmQgYnJvYWRzY2FzdFxuICAgIC8vZ2V0IGJyb2FkY2FzdCBpbnB1dFxuICAgIHZhciB0ZXh0ZmllbGQ6VGV4dEZpZWxkPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJicm9hZGNhc3RpbnB1dFwiKTtcbiAgICAvLyB3aGVuIHRleHRmaWVsZCBpcyBibGFuayBkb250IHNlbmQgYW55dGhpbmdcbiAgICBpZih0ZXh0ZmllbGQudGV4dC50cmltKCkgPT0gXCJcIikgcmV0dXJuO1xuICAgIC8vIHNlbmQgYnJvYWRjYXN0XG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcImJjXCIsIGRhdGE6IHsgbXNnOiB0ZXh0ZmllbGQudGV4dCwgbGluazogbnVsbCB9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzaG93SW5mbyhpZD86c3RyaW5nKXsgLy8gc2hvdyB1c2VyIGluZm9ybWF0aW9uXG4gICAgaWYodHlwZW9mIGlkICE9IFwic3RyaW5nXCIpe1xuICAgICAgICBhbGVydChKU09OLnN0cmluZ2lmeSh0aGlzLmNvbm5lY3QudXNlcixudWxsLDQpICsgXCJcXG5cIiArIEpTT04uc3RyaW5naWZ5KHRoaXMuY29ubmVjdC5yb29tLG51bGwsNCkpO1xuICAgIH1lbHNle1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodj0+IHYuaWQgPT0gaWQpWzBdO1xuICAgICAgICB2YXIgcm9vbSA9IHRoaXMuY29ubmVjdC5yb29tcy5maWx0ZXIodj0+IHYuaWQgPT0gdXNlci5yb29taWQpWzBdO1xuXG4gICAgICAgIGlmKHVzZXIgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgIHRpdGxlOiBcItiq2YbYqNmK2YdcIixcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwi2KfZhNi52LbZiCDYutmK2LEg2YXZiNis2YjYryDYp9mE2KfZhlwiXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhbGVydChKU09OLnN0cmluZ2lmeSh1c2VyLG51bGwsNCkgKyBcbiAgICAgICAgXCJcXG5cIiArIFxuICAgICAgICBKU09OLnN0cmluZ2lmeShyb29tLG51bGwsNCkpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVJvb21zIChyb29tcz86TGlzdFZpZXcpeyAvLyByZWZyZXNoIHJvb20gb25saW5lIHVzZXJzXG4gICAgaWYocm9vbXMgPT0gbnVsbCl7XG4gICAgICByb29tcyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpOyAgICAgIFxuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdC5yb29tcy5zb3J0KChhLCBiKSA9PiBiLm9ubGluZSAtIGEub25saW5lICk7XG5cbiAgICB0aGlzLmNvbm5lY3Qucm9vbXMuZm9yRWFjaCgoZWxlbWVudCxpbmRleCk9PntcbiAgICAgIHZhciB1c2Vyc1Jvb20gPSB0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHYgPT4gdi5yb29taWQgPT0gZWxlbWVudC5pZCk7XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXNbaW5kZXhdLm9ubGluZSA9IHVzZXJzUm9vbS5sZW5ndGg7XG4gICAgfSk7XG5cbiAgICByb29tcy5yZWZyZXNoKClcbiAgICBcbiAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICB9LDEwMDApO1xuICB9XG5cbiAgdXBkYXRlVXNlcnMgKHVzZXJzPzpMaXN0Vmlldyl7IC8vIHJlZnJlc2ggcm9vbSBvbmxpbmUgdXNlcnNcbiAgICBpZih1c2VycyA9PSBudWxsKXtcbiAgICAgIHVzZXJzID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpOyAgICAgIFxuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdC51c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcigodmFsdWUsaW5kZXgpID0+IHZhbHVlLmlkID09IHRoaXMuY29ubmVjdC51c2VyaWQpWzBdO1xuICAgIHRoaXMuY29ubmVjdC5yb29tID0gdGhpcy5jb25uZWN0LnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gdGhpcy5jb25uZWN0LnVzZXIpWzBdO1xuXG5cbiAgICB0aGlzLmNvbm5lY3QudXNlcnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYoYi5yZXAgPT0gdW5kZWZpbmVkIHx8IGIucmVwID09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiLnJlcCAtIGEucmVwO1xuICAgIH0gKTtcblxuICAgIHRoaXMuY29ubmVjdC51c2Vycy5mb3JFYWNoKChlbGVtZW50LGluZGV4KT0+e1xuICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdLnBvd2VyO1xuICAgICAgfSlbMF07XG5cbiAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICBzaWNvID0gdGhpcy5jb25uZWN0LnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5pY28gPSAodGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XSB8fCB7aWNvOicnfSkuaWNvIHx8ICcnO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5kaWNvID0gdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5pY28gOiAnJztcbiAgICAgIHRoaXMuY29ubmVjdC51c2Vyc1tpbmRleF0uc2ljbyA9IHNpY287XG5cbiAgICB9KTtcblxuICAgIHVzZXJzLnJlZnJlc2goKVxuICAgIFxuICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgIHRoaXMudXBkYXRlVXNlcnModXNlcnMpO1xuICAgIH0sMTAwMCk7XG4gIH1cblxuXG4gIHNob3dQcml2YXRlKCl7XG4gICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydwcml2YXRlJ10pO1xuICB9XG59Il19