"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_socket_io_1 = require("nativescript-socket.io");
var page_1 = require("ui/page");
var timer_1 = require("timer");
var dialogs = require("ui/dialogs");
var _ = require("underscore");
var Message = (function () {
    function Message(avatar, power, dr3, from, message, background, color, messageColor) {
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
                if (_this.messages.length > 100) {
                    _this.messages.shift();
                }
                _this.messages.push(new Message(_this.server + data.data.pic, sico, data.data.ico != '' ? _this.server + "dro3/" + data.data.ico : '', _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
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
                    var power = _this.powers.filter(function (value) {
                        return value.name == element.power;
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
                    element.ico = (element || { ico: '' }).ico || '';
                    element.bg = element.bg || '#FFFFFF';
                    element.bg = element.bg.replace(/\/|\\/, '');
                    element.ucol = element.ucol || '#000000';
                    element.ucol = element.ucol.replace(/\/|\\/, '');
                    element.mcol = element.mcol || '#000000';
                    element.mcol = element.mcol.replace(/\/|\\/, '');
                    element.sico = sico;
                    data.data.dico = data.data.ico != '' ? _this.server + "dro3/" + data.data.ico : '';
                    _this.users.push(element);
                });
                onlines.refresh();
                _this.updateUsers(onlines);
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
                var power = _this.powers.filter(function (value) {
                    return value.name == data.data.power;
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.server + "sico/" + power.ico;
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
                data.data.dico = data.data.ico != '' ? _this.server + "dro3/" + data.data.ico : '';
                data.data.sico = sico;
                _this.users.push(data.data);
                onlines.refresh();
                rooms.refresh();
            }
            if (data.cmd == "u^") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                _this.users.splice(_this.users.indexOf(_this.users.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                var sico = '';
                var power = _this.powers.filter(function (value) {
                    return value.name == data.data.power;
                })[0];
                if (power) {
                    if (power.ico != '') {
                        sico = _this.server + "sico/" + power.ico;
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
                data.data.dico = data.data.ico != '' ? _this.server + "dro3/" + data.data.ico : '';
                data.data.sico = sico;
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
                if (_this.broadcasts.length > 100) {
                    _this.broadcasts.shift();
                }
                _this.broadcasts.unshift(new Message(_this.server + data.data.pic, sico, data.data.ico != '' ? _this.server + "dro3/" + data.data.ico : '', _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
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
            _this.messages = [];
            _this.users = [];
            _this.powers = [];
            _this.broadcasts = [];
            _this.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! انقطع الاتصال'));
            notifications.refresh();
        });
        this.socket.on('connect_error', function (data) {
            _this.messages = [];
            _this.users = [];
            _this.powers = [];
            _this.broadcasts = [];
            _this.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! خطأ في الاتصال'));
            notifications.refresh();
        });
        this.socket.on('connect_timeout', function (data) {
            _this.messages = [];
            _this.users = [];
            _this.powers = [];
            _this.broadcasts = [];
            _this.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'اوه لا !! لا يمكنني الاتصال بالخادم'));
            notifications.refresh();
        });
        this.socket.on('reconnect_attempt', function (data) {
            _this.messages = [];
            _this.users = [];
            _this.powers = [];
            _this.broadcasts = [];
            _this.rooms = [];
            var notifications = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification(_this.server + 'pic.png', 'انا اقوم باعادة الاتصال بالخادم الان'));
            notifications.refresh();
        });
        this.socket.on('error', function (data) {
            _this.messages = [];
            _this.users = [];
            _this.powers = [];
            _this.broadcasts = [];
            _this.rooms = [];
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
    AppComponent.prototype.showInfo = function () {
        // this.user = this.users.filter((value,index) => value.id == this.userid)[0];
        // this.room = this.rooms.filter(v => v.id == this.user.roomid)[0];
        //
        // alert(JSON.stringify(this.user,null,4) + "\n" + JSON.stringify(this.room,null,4));
        alert("Messages Length: " + this.messages.length + "\nBroadcasts Length: " + this.broadcasts.length);
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
    AppComponent.prototype.updateUsers = function (users) {
        var _this = this;
        if (users == null) {
            users = this.page.getViewById("listOnline");
        }
        this.users.sort(function (a, b) {
            if (b.rep == undefined || b.rep == undefined) {
                return;
            }
            return b.rep - a.rep;
        });
        this.users.forEach(function (element, index) {
            var sico = '';
            var power = _this.powers.filter(function (value) {
                return value.name == _this.users[index].power;
            })[0];
            if (power) {
                if (power.ico != '') {
                    sico = _this.server + "sico/" + power.ico;
                }
            }
            _this.users[index].ico = (_this.users[index] || { ico: '' }).ico || '';
            _this.users[index].dico = _this.users[index].ico != '' ? _this.server + "dro3/" + _this.users[index].ico : '';
            _this.users[index].sico = sico;
        });
        users.refresh();
        timer_1.setTimeout(function () {
            _this.updateUsers(users);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMEM7QUFDMUMsaUVBQStEO0FBQy9ELGdDQUErQjtBQUkvQiwrQkFBa0M7QUFLbEMsb0NBQXVDO0FBQ3ZDLDhCQUFpQztBQUlqQztJQUNFLGlCQUFtQixNQUFhLEVBQVMsS0FBWSxFQUFRLEdBQVUsRUFBUSxJQUFXLEVBQVEsT0FBYyxFQUM3RixVQUFpQixFQUFRLEtBQVksRUFBUSxZQUFtQjtRQURoRSxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFFBQUcsR0FBSCxHQUFHLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztRQUM3RixlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLGlCQUFZLEdBQVosWUFBWSxDQUFPO0lBQUUsQ0FBQztJQUN4RixjQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUNFLHNCQUFtQixLQUFZLEVBQVEsT0FBYztRQUFsQyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFFLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUVELG1CQUFtQixJQUFXO0lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQU1ELElBQWEsWUFBWTtJQWN2QixzQkFBbUIsSUFBUztRQUFULFNBQUksR0FBSixJQUFJLENBQUs7UUFMckIsV0FBTSxHQUFXLHlCQUF5QixDQUFDO1FBSTFDLG9CQUFlLEdBQVcscUJBQXFCLENBQUM7UUFFdEQsSUFBSSxDQUFDLFFB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S0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztZQUNsRSxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLEdBQUcsS0FBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQzFHLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQyxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUVmLGtCQUFVLENBQUM7WUFDVCxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNWLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF6aEJELElBeWhCQztBQXpoQlksWUFBWTtJQUp4QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLG9CQUFvQjtLQUNsQyxDQUFDO3FDQWV3QixXQUFJO0dBZGpCLFlBQVksQ0F5aEJ4QjtBQXpoQlksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgTGlzdFZpZXcgfSBmcm9tIFwidWkvbGlzdC12aWV3XCI7XG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwidWkvdGV4dC1maWVsZFwiO1xuaW1wb3J0IHsgVGFiVmlld0l0ZW0gfSBmcm9tIFwidWkvdGFiLXZpZXdcIjtcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0aW1lcidcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcImFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tIFwicGxhdGZvcm1cIjtcblxuaW1wb3J0IGRpYWxvZ3MgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcbmltcG9ydCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmVcIik7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5mdW5jdGlvbiBfdW5lc2NhcGUoY29kZTpzdHJpbmcpOiBzdHJpbmd7XG4gIHJldHVybiBfLnVuZXNjYXBlKGNvZGUpLnJlcGxhY2UoLyYjeDNDOy8sJzwnKTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCdcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgcHVibGljIG1lc3NhZ2VzOiBBcnJheTxNZXNzYWdlPjtcbiAgcHVibGljIGJyb2FkY2FzdHM6IEFycmF5PE1lc3NhZ2U+O1xuICBwdWJsaWMgbm90aWZpY2F0aW9uczogQXJyYXk8Tm90aWZpY2F0aW9uPjtcbiAgcHVibGljIHVzZXJzOiBBcnJheTxhbnk+O1xuICBwdWJsaWMgdXNlcjogYW55O1xuICBwdWJsaWMgcm9vbXM6IEFycmF5PGFueT47XG4gIHB1YmxpYyByb29tOiBhbnk7XG4gIHB1YmxpYyBwb3dlcnM6IEFycmF5PGFueT47XG4gIHB1YmxpYyBzZXJ2ZXI6IHN0cmluZyA9IFwiaHR0cDovL2toYWxlZWpjaGF0LmNvbS9cIjtcblxuICBwcml2YXRlIHNvY2tldDtcbiAgcHVibGljIHVzZXJpZDogc3RyaW5nO1xuICBwcml2YXRlIGNvbm5lY3Rpb25fbmFtZTogc3RyaW5nID0gXCJBbmRyb2lkIEFwcGxpY2F0aW9uXCI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYWdlOlBhZ2Upe1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB0aGlzLnVzZXJzID0gW107XG4gICAgdGhpcy5wb3dlcnMgPSBbXTtcbiAgICB0aGlzLmJyb2FkY2FzdHMgPSBbXTtcbiAgICB0aGlzLnJvb21zID0gW107XG4gIH1cblxuICBjb25uZWN0aW9uKCl7XG4gICAgdmFyIHNlcnZlcjpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJpcFwiKTtcbiAgICB2YXIgdXNlcm5hbWU6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidXNlcm5hbWVcIik7XG4gICAgdmFyIHBhc3N3b3JkOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInBhc3N3b3JkXCIpO1xuICAgIHRoaXMuc2VydmVyID0gc2VydmVyLnRleHQ7XG5cbiAgICB0aGlzLnNvY2tldCA9IGNvbm5lY3QodGhpcy5zZXJ2ZXIsIDxTb2NrZXRPcHRpb25zPiB7IHRyYW5zcG9ydHM6IFsncG9sbGluZycsICd3ZWJzb2NrZXQnXSB9KTtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsICgpID0+IHtcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIgKyAncGljLnBuZycsJ9iq2YUg2KfZhNin2KrYtdin2YQg2KjZhtis2KfYrScpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiBcImxvZ2luXCIgLCBkYXRhOntcbiAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLnRleHQsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZC50ZXh0LFxuICAgICAgICBzdGVhbHRoOiB0cnVlLFxuICAgICAgICBmcDogdGhpcy5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICByZWZyOiB0aGlzLmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgIHI6IHRoaXMuY29ubmVjdGlvbl9uYW1lXG4gICAgICB9fSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignbXNnJywgKGRhdGEpID0+IHtcbiAgICAgIGlmKHR5cGVvZiBkYXRhLmRhdGEgPT09IFwic3RyaW5nXCIgJiYgZGF0YS5jbWQgIT0gJ3UtJyl7XG4gICAgICAgICAgZGF0YS5kYXRhID0gSlNPTi5wYXJzZSh1bmVzY2FwZShkYXRhLmRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJsb2dpblwiKXsgLy8gb24gbG9naW4gdG8gc2VydmVyXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tc2cgPSBcIm9rXCIpe1xuICAgICAgICAgIHRoaXMudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwibXNnXCIpeyAvLyByb29tIG1lc3NhZ2UgXG4gICAgICAgIHZhciBtZXNzYWdlczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE1lc3NhZ2VzXCIpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhLmljbyA9ICh1c2VyIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMTAwKXtcbiAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goIG5ldyBNZXNzYWdlKHRoaXMuc2VydmVyICsgZGF0YS5kYXRhLnBpYywgc2ljbywgZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnLCBfdW5lc2NhcGUoZGF0YS5kYXRhLnRvcGljKSwgX3VuZXNjYXBlKGRhdGEuZGF0YS5tc2cucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZGF0YS5kYXRhLmJnLCBkYXRhLmRhdGEudWNvbCwgZGF0YS5kYXRhLm1jb2wpICk7XG4gICAgICAgIG1lc3NhZ2VzLnJlZnJlc2goKTsgIFxuICAgICAgICBcbiAgICAgICAgaWYgKG1lc3NhZ2VzLmlvcykge1xuICAgICAgICAgICAgbWVzc2FnZXMuaW9zLnNjcm9sbFRvUm93QXRJbmRleFBhdGhBdFNjcm9sbFBvc2l0aW9uQW5pbWF0ZWQoXG4gICAgICAgICAgICAgICAgTlNJbmRleFBhdGguaW5kZXhQYXRoRm9ySXRlbUluU2VjdGlvbih0aGlzLm1lc3NhZ2VzLmxlbmd0aC0xLCAwKSxcbiAgICAgICAgICAgICAgICBVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLlVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb25Ub3AsXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnNjcm9sbFRvSW5kZXgodGhpcy5tZXNzYWdlcy5sZW5ndGgtMSk7IFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmNtZCA9PSBcIm5vdFwiKXsgLy8gbm90aWZpY2F0aW9uc1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy51c2Vycy5maWx0ZXIodmFsdWUgPT4gdmFsdWUuaWQgPT0gZGF0YS5kYXRhLnVzZXIpWzBdIHx8IHsgcGljOiBcIlwiIH07XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIrIHVzZXIucGljLF91bmVzY2FwZShkYXRhLmRhdGEubXNnLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKSkpKTtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidWxpc3RcIil7IC8vIHVzZXJzIG9ubGluZVxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSBlbGVtZW50LnBvd2VyO1xuICAgICAgICAgIH0pWzBdO1xuXG4gICAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgICAgc2ljbyA9IHRoaXMuc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgICAgZWxlbWVudC5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50LnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihlbGVtZW50Lm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgICAgZWxlbWVudC5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGVsZW1lbnQuaWNvID0gKGVsZW1lbnQgfHwge2ljbzonJ30pLmljbyB8fCAnJztcblxuICAgICAgICAgIGVsZW1lbnQuYmcgICAgPSBlbGVtZW50LmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgICBlbGVtZW50LmJnICAgID0gZWxlbWVudC5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICAgIGVsZW1lbnQudWNvbCAgPSBlbGVtZW50LnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgICBlbGVtZW50LnVjb2wgID0gZWxlbWVudC51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgICAgZWxlbWVudC5tY29sICA9IGVsZW1lbnQubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICAgIGVsZW1lbnQubWNvbCAgPSBlbGVtZW50Lm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcblxuICAgICAgICAgIGVsZW1lbnQuc2ljbyAgPSBzaWNvO1xuXG4gICAgICAgICAgZGF0YS5kYXRhLmRpY28gPSBkYXRhLmRhdGEuaWNvICE9ICcnID8gdGhpcy5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJyc7XG5cbiAgICAgICAgICB0aGlzLnVzZXJzLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgIHRoaXMudXBkYXRlVXNlcnMob25saW5lcyk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidS1cIil7IC8vIHVzZXIgbGVmdFxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHRoaXMudXNlcnMuc3BsaWNlKHRoaXMudXNlcnMuaW5kZXhPZih0aGlzLnVzZXJzLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhKVswXSksIDEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInUrXCIpeyAvLyB1c2VyIGpvaW5cbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IGRhdGEuZGF0YS5wb3dlcjtcbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmljbyA9IChkYXRhLmRhdGEgfHwge2ljbzonJ30pLmljbyB8fCAnJzsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuXG4gICAgICAgIGRhdGEuZGF0YS5kaWNvID0gZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnO1xuXG4gICAgICAgIGRhdGEuZGF0YS5zaWNvICA9IHNpY287XG4gICAgICAgIHRoaXMudXNlcnMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVeXCIpeyAvLyB1c2VyIGVkaXRcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnVzZXJzLnNwbGljZSh0aGlzLnVzZXJzLmluZGV4T2YodGhpcy51c2Vycy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IGRhdGEuZGF0YS5wb3dlcjtcbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmljbyA9IChkYXRhLmRhdGEgfHwge2ljbzonJ30pLmljbyB8fCAnJzsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuXG4gICAgICAgIGRhdGEuZGF0YS5kaWNvID0gZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnO1xuXG4gICAgICAgIGRhdGEuZGF0YS5zaWNvICA9IHNpY287XG5cbiAgICAgICAgdGhpcy51c2Vycy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidXJcIil7IC8vIHVzZXIgam9pbiByb29tXG4gICAgICAgIGlmKHRoaXMucm9vbXMgPT0gW10gfHwgdGhpcy51c2VycyA9PSBbXSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnNbdGhpcy51c2Vycy5pbmRleE9mKHRoaXMudXNlcnMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGFbMF0pWzBdKV07XG4gICAgICAgIGlmICh1c2VyID09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgIHJvb21pZDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXNlci5yb29taWQgPSBkYXRhLmRhdGFbMV07XG4gICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicG93ZXJzXCIpeyAvLyBwb3dlcnNcbiAgICAgICAgdGhpcy5wb3dlcnMgPSBkYXRhLmRhdGE7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPCB0aGlzLnBvd2Vycy5sZW5ndGg7aSsrKVxuICAgICAgICB7XG4gICAgICAgICAgdmFyIHBuYW1lPSB0aGlzLnBvd2Vyc1tpXS5uYW1lO1xuICAgICAgICAgIGlmKHBuYW1lPT0nJyl7cG5hbWU9J18nO31cbiAgICAgICAgICB0aGlzLnBvd2Vyc1twbmFtZV0gPSB0aGlzLnBvd2Vyc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSAnYmMnKXsgLy8gYnJvYWRjYXN0XG4gICAgICAgIHZhciBicm9hZGNhc3RzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0QnJvYWRjYXN0XCIpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmljbyA9ICh1c2VyIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYodGhpcy5icm9hZGNhc3RzLmxlbmd0aCA+IDEwMCl7XG4gICAgICAgICAgdGhpcy5icm9hZGNhc3RzLnNoaWZ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJyb2FkY2FzdHMudW5zaGlmdCggbmV3IE1lc3NhZ2UodGhpcy5zZXJ2ZXIgKyBkYXRhLmRhdGEucGljLCBzaWNvLCBkYXRhLmRhdGEuaWNvICE9ICcnID8gdGhpcy5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJycsIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcbiAgICAgICAgYnJvYWRjYXN0cy5yZWZyZXNoKCk7ICBcbiAgICAgICAgXG4gICAgICAgIGlmIChicm9hZGNhc3RzLmlvcykge1xuICAgICAgICAgICAgYnJvYWRjYXN0cy5pb3Muc2Nyb2xsVG9Sb3dBdEluZGV4UGF0aEF0U2Nyb2xsUG9zaXRpb25BbmltYXRlZChcbiAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKDAsIDApLFxuICAgICAgICAgICAgICAgIFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24uVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvblRvcCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYnJvYWRjYXN0cy5zY3JvbGxUb0luZGV4KDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicmxpc3RcIil7IC8vIHJvb21zIGxpc3RcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIGVsZW1lbnQub25saW5lID0gMDtcbiAgICAgICAgICB0aGlzLnJvb21zLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicitcIil7IC8vIGFkZCByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnJvb21zLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInItXCIpeyAvLyByZW1vdmUgcm9vbVxuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5yb29tcy5zcGxpY2UodGhpcy5yb29tcy5pbmRleE9mKHRoaXMucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJyXlwiKXsgLy8gcm9vbSBlZGl0XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnJvb21zLnNwbGljZSh0aGlzLnJvb21zLmluZGV4T2YodGhpcy5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdGhpcy5yb29tcy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKGRhdGEpID0+IHsgXG4gICAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLnVzZXJzID0gW107XG4gICAgICB0aGlzLnBvd2VycyA9IFtdO1xuICAgICAgdGhpcy5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2KfZhtmC2LfYuSDYp9mE2KfYqti12KfZhCcpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGRhdGEpID0+IHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMudXNlcnMgPSBbXTtcbiAgICAgIHRoaXMucG93ZXJzID0gW107XG4gICAgICB0aGlzLmJyb2FkY2FzdHMgPSBbXTtcbiAgICAgIHRoaXMucm9vbXMgPSBbXTsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYrti32KMg2YHZiiDYp9mE2KfYqti12KfZhCcpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpOyAgXG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3RfdGltZW91dCcsIChkYXRhKSA9PiB7IFxuICAgICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy51c2VycyA9IFtdO1xuICAgICAgdGhpcy5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5yb29tcyA9IFtdOyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINmE2Kcg2YrZhdmD2YbZhtmKINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdF9hdHRlbXB0JywgKGRhdGEpID0+IHsgXG4gICAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLnVzZXJzID0gW107XG4gICAgICB0aGlzLnBvd2VycyA9IFtdO1xuICAgICAgdGhpcy5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLnNlcnZlciArICdwaWMucG5nJywn2KfZhtinINin2YLZiNmFINio2KfYudin2K/YqSDYp9mE2KfYqti12KfZhCDYqNin2YTYrtin2K/ZhSDYp9mE2KfZhicpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChkYXRhKSA9PiB7IFxuICAgICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy51c2VycyA9IFtdO1xuICAgICAgdGhpcy5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5yb29tcyA9IFtdOyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINit2K/YqyDYrti32KMg2YXYpycpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgIH0pO1xuXG4gIH1cblxuICBzZW5kQWR2ZXJ0aXNpbmcoKXtcbiAgICBkaWFsb2dzLnByb21wdChcItil2LHYs9in2YQg2KXZh9mE2KfZhlwiLCBcIlwiKS50aGVuKHIgPT4ge1xuICAgICAgICBpZihyLnJlc3VsdCl7IC8vIG9uIHByZXNzIG9rXG4gICAgICAgICAgLy8gc2VuZCBBZHZlcnRpc2luZ1xuICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoXCJtc2dcIiwge2NtZDogXCJwbXNnXCIsIGRhdGE6IHsgbXNnOiByLnRleHQgfX0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkl0ZW1UYXAoZXZ0KXtcbiAgICBcbiAgfVxuXG4gIGpvaW5Sb29tKGV2ZW50LHJvb21pZCl7IC8vIGpvaW4gcm9vbVxuICAgIC8vIGpvaW4gcm9vbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbSBpZFxuICAgIHRoaXMuc29ja2V0LmVtaXQoXCJtc2dcIix7Y21kOlwicmpvaW5cIiwgZGF0YToge2lkOiB0aGlzLnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gcm9vbWlkKVswXS5pZCB9IH0pO1xuICB9O1xuXG4gIHNlbmRNZXNzYWdlKCl7IC8vIHNlbmQgbWVzc2FnZSB0byB1c2VyIHJvb21cbiAgICAvLyBnZXQgbWVzc2FnZSBpbnB1dFxuICAgIHZhciB0ZXh0ZmllbGQ6VGV4dEZpZWxkPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJtZXNzYWdlaW5wdXRcIik7XG4gICAgLy8gd2hlbiB0ZXh0ZmllbGQgaXMgYmxhbmsgZG9udCBzZW5kIGFueXRoaW5nXG4gICAgaWYodGV4dGZpZWxkLnRleHQudHJpbSgpID09IFwiXCIpIHJldHVybjtcbiAgICAvLyBzZW5kIG1lc3NhZ2VcbiAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcIm1zZ1wiLCBkYXRhOiB7bXNnOiB0ZXh0ZmllbGQudGV4dH0gfSk7XG4gICAgLy8gc2V0IHRleHRmaWVsZCBibGFua1xuICAgIHRleHRmaWVsZC50ZXh0ID0gXCJcIjtcbiAgfVxuXG4gIHNlbmRCcm9hZGNhc3QoKXsgLy8gc2VuZCBicm9hZHNjYXN0XG4gICAgLy9nZXQgYnJvYWRjYXN0IGlucHV0XG4gICAgdmFyIHRleHRmaWVsZDpUZXh0RmllbGQ9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImJyb2FkY2FzdGlucHV0XCIpO1xuICAgIC8vIHdoZW4gdGV4dGZpZWxkIGlzIGJsYW5rIGRvbnQgc2VuZCBhbnl0aGluZ1xuICAgIGlmKHRleHRmaWVsZC50ZXh0LnRyaW0oKSA9PSBcIlwiKSByZXR1cm47XG4gICAgLy8gc2VuZCBicm9hZGNhc3RcbiAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcImJjXCIsIGRhdGE6IHsgbXNnOiB0ZXh0ZmllbGQudGV4dCwgbGluazogbnVsbCB9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzaG93SW5mbygpe1xuICAgIC8vIHRoaXMudXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKCh2YWx1ZSxpbmRleCkgPT4gdmFsdWUuaWQgPT0gdGhpcy51c2VyaWQpWzBdO1xuICAgIC8vIHRoaXMucm9vbSA9IHRoaXMucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSB0aGlzLnVzZXIucm9vbWlkKVswXTtcbiAgICAvL1xuICAgIC8vIGFsZXJ0KEpTT04uc3RyaW5naWZ5KHRoaXMudXNlcixudWxsLDQpICsgXCJcXG5cIiArIEpTT04uc3RyaW5naWZ5KHRoaXMucm9vbSxudWxsLDQpKTtcbiAgICBhbGVydCggXCJNZXNzYWdlcyBMZW5ndGg6IFwiICsgdGhpcy5tZXNzYWdlcy5sZW5ndGggKyBcIlxcbkJyb2FkY2FzdHMgTGVuZ3RoOiBcIiArIHRoaXMuYnJvYWRjYXN0cy5sZW5ndGggKTtcbiAgfVxuXG4gIHVwZGF0ZVJvb21zIChyb29tcz86TGlzdFZpZXcpeyAvLyByZWZyZXNoIHJvb20gb25saW5lIHVzZXJzXG4gICAgaWYocm9vbXMgPT0gbnVsbCl7XG4gICAgICByb29tcyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpOyAgICAgIFxuICAgIH1cblxuICAgIHRoaXMucm9vbXMuc29ydCgoYSwgYikgPT4gYi5vbmxpbmUgLSBhLm9ubGluZSApO1xuXG4gICAgdGhpcy5yb29tcy5mb3JFYWNoKChlbGVtZW50LGluZGV4KT0+e1xuICAgICAgdmFyIHVzZXJzUm9vbSA9IHRoaXMudXNlcnMuZmlsdGVyKHYgPT4gdi5yb29taWQgPT0gZWxlbWVudC5pZCk7XG4gICAgICB0aGlzLnJvb21zW2luZGV4XS5vbmxpbmUgPSB1c2Vyc1Jvb20ubGVuZ3RoO1xuICAgIH0pO1xuXG4gICAgcm9vbXMucmVmcmVzaCgpXG4gICAgXG4gICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgdmFyIHRhYk5vdGlmaWNhdGlvbnM6VGFiVmlld0l0ZW0gPSA8VGFiVmlld0l0ZW0+dGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidGFiTm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHZhciB0YWJPbmxpbmU6VGFiVmlld0l0ZW0gPSA8VGFiVmlld0l0ZW0+dGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidGFiT25saW5lc1wiKTtcbiAgICAgIHRhYk5vdGlmaWNhdGlvbnMudGl0bGUgPSBcItin2YTYo9i02LnYp9ix2KfYqiBcIiArIHRoaXMubm90aWZpY2F0aW9ucy5sZW5ndGg7XG4gICAgICB0YWJPbmxpbmUudGl0bGUgPSBcItin2YTZhdiq2LXZhNmK2YYgXCIgKyB0aGlzLnVzZXJzLmxlbmd0aDtcblxuICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgfSwxMDAwKTtcbiAgfVxuICB1cGRhdGVVc2VycyAodXNlcnM/Okxpc3RWaWV3KXsgLy8gcmVmcmVzaCByb29tIG9ubGluZSB1c2Vyc1xuICAgIGlmKHVzZXJzID09IG51bGwpe1xuICAgICAgdXNlcnMgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7ICAgICAgXG4gICAgfVxuXG4gICAgdGhpcy51c2Vycy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZihiLnJlcCA9PSB1bmRlZmluZWQgfHwgYi5yZXAgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGIucmVwIC0gYS5yZXA7XG4gICAgfSApO1xuXG4gICAgdGhpcy51c2Vycy5mb3JFYWNoKChlbGVtZW50LGluZGV4KT0+e1xuICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgIHZhciBwb3dlciA9IHRoaXMucG93ZXJzLmZpbHRlcih2YWx1ZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdGhpcy51c2Vyc1tpbmRleF0ucG93ZXI7XG4gICAgICB9KVswXTtcblxuICAgICAgaWYocG93ZXIpe1xuICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgIHNpY28gPSB0aGlzLnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy51c2Vyc1tpbmRleF0uaWNvID0gKHRoaXMudXNlcnNbaW5kZXhdIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7XG4gICAgICB0aGlzLnVzZXJzW2luZGV4XS5kaWNvID0gdGhpcy51c2Vyc1tpbmRleF0uaWNvICE9ICcnID8gdGhpcy5zZXJ2ZXIgKyBcImRybzMvXCIgKyB0aGlzLnVzZXJzW2luZGV4XS5pY28gOiAnJztcbiAgICAgIHRoaXMudXNlcnNbaW5kZXhdLnNpY28gPSBzaWNvO1xuXG4gICAgfSk7XG5cbiAgICB1c2Vycy5yZWZyZXNoKClcbiAgICBcbiAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICB0aGlzLnVwZGF0ZVVzZXJzKHVzZXJzKTtcbiAgICB9LDEwMDApO1xuICB9XG59Il19