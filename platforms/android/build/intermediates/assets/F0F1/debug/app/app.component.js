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
                data.data.ucol = data.data.ucol || '#000000';
                data.data.mcol = data.data.mcol || '#000000';
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
                    element.ucol = element.ucol || '#000000';
                    element.mcol = element.mcol || '#000000';
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
                data.data.ucol = data.data.ucol || '#000000';
                data.data.mcol = data.data.mcol || '#000000';
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
                data.data.ucol = data.data.ucol || '#000000';
                data.data.mcol = data.data.mcol || '#000000';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMEM7QUFDMUMsaUVBQStEO0FBQy9ELGdDQUErQjtBQUkvQiwrQkFBa0M7QUFDbEMsb0NBQXVDO0FBQ3ZDLDhCQUFpQztBQUdqQztJQUNFLGlCQUFtQixNQUFhLEVBQVMsS0FBWSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQzNFLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLFdBQU0sR0FBTixNQUFNLENBQU87UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsU0FBSSxHQUFKLElBQUksQ0FBTztRQUFRLFlBQU8sR0FBUCxPQUFPLENBQU87UUFDM0UsZUFBVSxHQUFWLFVBQVUsQ0FBTztRQUFRLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxpQkFBWSxHQUFaLFlBQVksQ0FBTztJQUFFLENBQUM7SUFDeEYsY0FBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBRUQ7SUFDRSxzQkFBbUIsS0FBWSxFQUFRLE9BQWM7UUFBbEMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFlBQU8sR0FBUCxPQUFPLENBQU87SUFBRSxDQUFDO0lBQzFELG1CQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFFRCxtQkFBbUIsSUFBVztJQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFNRCxJQUFhLFlBQVk7SUFjdkIsc0JBQW1CLElBQVM7UUFBVCxTQUFJLEdBQUosSUFBSSxDQUFLO1FBTHJCLFdBQU0sR0FBVyx5QkFBeUIsQ0FBQztRQUkxQyxvQkFBZSxHQUFXLHFCQUFxQixDQUFDO1FBRXRELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxh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QUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsRUFBRSxFQUF0QixDQUFzQixDQUFDLENBQUM7WUFDL0QsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUVmLGtCQUFVLENBQUM7WUFDVCxJQUFJLGdCQUFnQixHQUE0QixLQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFGLElBQUksU0FBUyxHQUE0QixLQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3RSxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsWUFBWSxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsV0FBVyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBRWxELEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWpZRCxJQWlZQztBQWpZWSxZQUFZO0lBSnhCLGdCQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsUUFBUTtRQUNsQixXQUFXLEVBQUUsb0JBQW9CO0tBQ2xDLENBQUM7cUNBZXdCLFdBQUk7R0FkakIsWUFBWSxDQWlZeEI7QUFqWVksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgTGlzdFZpZXcgfSBmcm9tIFwidWkvbGlzdC12aWV3XCI7XG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwidWkvdGV4dC1maWVsZFwiO1xuaW1wb3J0IHsgVGFiVmlld0l0ZW0gfSBmcm9tIFwidWkvdGFiLXZpZXdcIjtcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0aW1lcidcbmltcG9ydCBkaWFsb2dzID0gcmVxdWlyZShcInVpL2RpYWxvZ3NcIik7XG5pbXBvcnQgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlXCIpO1xuZGVjbGFyZSB2YXIgTlNJbmRleFBhdGgsVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbix1bmVzY2FwZTtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5mdW5jdGlvbiBfdW5lc2NhcGUoY29kZTpzdHJpbmcpOiBzdHJpbmd7XG4gIHJldHVybiBfLnVuZXNjYXBlKGNvZGUpLnJlcGxhY2UoLyYjeDNDOy8sJzwnKTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCdcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgcHVibGljIG1lc3NhZ2VzOiBBcnJheTxNZXNzYWdlPjtcbiAgcHVibGljIGJyb2FkY2FzdHM6IEFycmF5PE1lc3NhZ2U+O1xuICBwdWJsaWMgbm90aWZpY2F0aW9uczogQXJyYXk8Tm90aWZpY2F0aW9uPjtcbiAgcHVibGljIHVzZXJzOiBBcnJheTxhbnk+O1xuICBwdWJsaWMgdXNlcjogYW55O1xuICBwdWJsaWMgcm9vbXM6IEFycmF5PGFueT47XG4gIHB1YmxpYyByb29tOiBhbnk7XG4gIHB1YmxpYyBwb3dlcnM6IEFycmF5PGFueT47XG4gIHB1YmxpYyBzZXJ2ZXI6IHN0cmluZyA9IFwiaHR0cDovL2toYWxlZWpjaGF0LmNvbS9cIjtcblxuICBwcml2YXRlIHNvY2tldDtcbiAgcHVibGljIHVzZXJpZDogc3RyaW5nO1xuICBwcml2YXRlIGNvbm5lY3Rpb25fbmFtZTogc3RyaW5nID0gXCJBbmRyb2lkIEFwcGxpY2F0aW9uXCI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYWdlOlBhZ2Upe1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB0aGlzLnVzZXJzID0gW107XG4gICAgdGhpcy5wb3dlcnMgPSBbXTtcbiAgICB0aGlzLmJyb2FkY2FzdHMgPSBbXTtcbiAgICB0aGlzLnJvb21zID0gW107XG4gIH1cblxuICBjb25uZWN0aW9uKCl7XG4gICAgdmFyIHNlcnZlcjpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJpcFwiKTtcbiAgICB2YXIgdXNlcm5hbWU6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidXNlcm5hbWVcIik7XG4gICAgdmFyIHBhc3N3b3JkOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInBhc3N3b3JkXCIpO1xuICAgIHRoaXMuc2VydmVyID0gc2VydmVyLnRleHQ7XG4gICAgXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMubm90aWZpY2F0aW9ucyA9IFtdO1xuICAgIHRoaXMudXNlcnMgPSBbXTtcbiAgICB0aGlzLnBvd2VycyA9IFtdO1xuICAgIHRoaXMuYnJvYWRjYXN0cyA9IFtdO1xuICAgIHRoaXMucm9vbXMgPSBbXTsgXG5cbiAgICB0aGlzLnNvY2tldCA9IGNvbm5lY3QodGhpcy5zZXJ2ZXIsIDxTb2NrZXRPcHRpb25zPiB7IHRyYW5zcG9ydHM6IFsncG9sbGluZycsICd3ZWJzb2NrZXQnXSB9KTtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsICgpID0+IHtcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIgKyAncGljLnBuZycsJ9iq2YUg2KfZhNin2KrYtdin2YQg2KjZhtis2KfYrScpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiBcImxvZ2luXCIgLCBkYXRhOntcbiAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLnRleHQsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZC50ZXh0LFxuICAgICAgICBzdGVhbHRoOiB0cnVlLFxuICAgICAgICBmcDogdGhpcy5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICByZWZyOiB0aGlzLmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgIHI6IHRoaXMuY29ubmVjdGlvbl9uYW1lXG4gICAgICB9fSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignbXNnJywgKGRhdGEpID0+IHtcbiAgICAgIGlmKHR5cGVvZiBkYXRhLmRhdGEgPT09IFwic3RyaW5nXCIgJiYgZGF0YS5jbWQgIT0gJ3UtJyl7XG4gICAgICAgICAgZGF0YS5kYXRhID0gSlNPTi5wYXJzZSh1bmVzY2FwZShkYXRhLmRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJsb2dpblwiKXsgLy8gb24gbG9naW4gdG8gc2VydmVyXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tc2cgPSBcIm9rXCIpe1xuICAgICAgICAgIHRoaXMudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwibXNnXCIpeyAvLyByb29tIG1lc3NhZ2UgXG4gICAgICAgIHZhciBtZXNzYWdlczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE1lc3NhZ2VzXCIpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEubWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgfHwgJyMwMDAwMDAnO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaCggbmV3IE1lc3NhZ2UodGhpcy5zZXJ2ZXIgKyBkYXRhLmRhdGEucGljLCBzaWNvLCBfdW5lc2NhcGUoZGF0YS5kYXRhLnRvcGljKSwgX3VuZXNjYXBlKGRhdGEuZGF0YS5tc2cucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZGF0YS5kYXRhLmJnLCBkYXRhLmRhdGEudWNvbCwgZGF0YS5kYXRhLm1jb2wpICk7XG4gICAgICAgIG1lc3NhZ2VzLnJlZnJlc2goKTsgIFxuICAgICAgICBcbiAgICAgICAgaWYgKG1lc3NhZ2VzLmlvcykge1xuICAgICAgICAgICAgbWVzc2FnZXMuaW9zLnNjcm9sbFRvUm93QXRJbmRleFBhdGhBdFNjcm9sbFBvc2l0aW9uQW5pbWF0ZWQoXG4gICAgICAgICAgICAgICAgTlNJbmRleFBhdGguaW5kZXhQYXRoRm9ySXRlbUluU2VjdGlvbih0aGlzLm1lc3NhZ2VzLmxlbmd0aC0xLCAwKSxcbiAgICAgICAgICAgICAgICBVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLlVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb25Ub3AsXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnNjcm9sbFRvSW5kZXgodGhpcy5tZXNzYWdlcy5sZW5ndGgtMSk7IFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmNtZCA9PSBcIm5vdFwiKXsgLy8gbm90aWZpY2F0aW9uc1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy51c2Vycy5maWx0ZXIodmFsdWUgPT4gdmFsdWUuaWQgPT0gZGF0YS5kYXRhLnVzZXIpWzBdIHx8IHsgcGljOiBcIlwiIH07XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIrIHVzZXIucGljLF91bmVzY2FwZShkYXRhLmRhdGEubXNnLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKSkpKTtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidWxpc3RcIil7IC8vIHVzZXJzIG9ubGluZVxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgaWYoZWxlbWVudC5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50LmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWxlbWVudC51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICAgIGVsZW1lbnQudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50Lm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgZWxlbWVudC5iZyAgICA9IGVsZW1lbnQuYmcgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgICAgZWxlbWVudC51Y29sICA9IGVsZW1lbnQudWNvbCB8fCAnIzAwMDAwMCc7XG4gICAgICAgICAgZWxlbWVudC5tY29sICA9IGVsZW1lbnQubWNvbCB8fCAnIzAwMDAwMCc7XG5cbiAgICAgICAgICB0aGlzLnVzZXJzLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidS1cIil7IC8vIHVzZXIgbGVmdFxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHRoaXMudXNlcnMuc3BsaWNlKHRoaXMudXNlcnMuaW5kZXhPZih0aGlzLnVzZXJzLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhKVswXSksIDEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInUrXCIpeyAvLyB1c2VyIGpvaW5cbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICBcbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCB8fCAnIzAwMDAwMCc7XG4gICAgICAgIHRoaXMudXNlcnMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVeXCIpeyAvLyB1c2VyIGVkaXRcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnVzZXJzLnNwbGljZSh0aGlzLnVzZXJzLmluZGV4T2YodGhpcy51c2Vycy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdGhpcy51c2Vycy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidXJcIil7IC8vIHVzZXIgam9pbiByb29tXG4gICAgICAgIGlmKHRoaXMucm9vbXMgPT0gW10gfHwgdGhpcy51c2VycyA9PSBbXSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnNbdGhpcy51c2Vycy5pbmRleE9mKHRoaXMudXNlcnMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGFbMF0pWzBdKV07XG4gICAgICAgIGlmICh1c2VyID09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgIHJvb21pZDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXNlci5yb29taWQgPSBkYXRhLmRhdGFbMV07XG4gICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicG93ZXJzXCIpeyAvLyBwb3dlcnNcbiAgICAgICAgdGhpcy5wb3dlcnMgPSBkYXRhLmRhdGE7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPCB0aGlzLnBvd2Vycy5sZW5ndGg7aSsrKVxuICAgICAgICB7XG4gICAgICAgICAgdmFyIHBuYW1lPSB0aGlzLnBvd2Vyc1tpXS5uYW1lO1xuICAgICAgICAgIGlmKHBuYW1lPT0nJyl7cG5hbWU9J18nO31cbiAgICAgICAgICB0aGlzLnBvd2Vyc1twbmFtZV0gPSB0aGlzLnBvd2Vyc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSAnYmMnKXsgLy8gYnJvYWRjYXN0XG4gICAgICAgIHZhciBicm9hZGNhc3RzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0QnJvYWRjYXN0XCIpO1xuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCB8fCAnIzAwMDAwMCc7XG4gICAgICAgIHRoaXMuYnJvYWRjYXN0cy51bnNoaWZ0KCBuZXcgTWVzc2FnZSh0aGlzLnNlcnZlciArIGRhdGEuZGF0YS5waWMsIHNpY28sIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcbiAgICAgICAgYnJvYWRjYXN0cy5yZWZyZXNoKCk7ICBcbiAgICAgICAgXG4gICAgICAgIGlmIChicm9hZGNhc3RzLmlvcykge1xuICAgICAgICAgICAgYnJvYWRjYXN0cy5pb3Muc2Nyb2xsVG9Sb3dBdEluZGV4UGF0aEF0U2Nyb2xsUG9zaXRpb25BbmltYXRlZChcbiAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKDAsIDApLFxuICAgICAgICAgICAgICAgIFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24uVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvblRvcCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYnJvYWRjYXN0cy5zY3JvbGxUb0luZGV4KDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicmxpc3RcIil7IC8vIHJvb21zIGxpc3RcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIGVsZW1lbnQub25saW5lID0gMDtcbiAgICAgICAgICB0aGlzLnJvb21zLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKCk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicitcIil7IC8vIGFkZCByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnJvb21zLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInItXCIpeyAvLyByZW1vdmUgcm9vbVxuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5yb29tcy5zcGxpY2UodGhpcy5yb29tcy5pbmRleE9mKHRoaXMucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJyXlwiKXsgLy8gcm9vbSBlZGl0XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLnJvb21zLnNwbGljZSh0aGlzLnJvb21zLmluZGV4T2YodGhpcy5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdGhpcy5yb29tcy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYp9mG2YLYt9i5INin2YTYp9iq2LXYp9mEJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3RfZXJyb3InLCAoZGF0YSkgPT4ge1xuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2K7Yt9ijINmB2Yog2KfZhNin2KrYtdin2YQnKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTsgIFxuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X3RpbWVvdXQnLCAoZGF0YSkgPT4geyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINmE2Kcg2YrZhdmD2YbZhtmKINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdF9hdHRlbXB0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mG2Kcg2KfZgtmI2YUg2KjYp9i52KfYr9ipINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFINin2YTYp9mGJykpO1xuICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYrdiv2Ksg2K7Yt9ijINmF2KcnKSk7XG4gICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICB9KTtcblxuICB9XG5cbiAgc2VuZEFkdmVydGlzaW5nKCl7XG4gICAgZGlhbG9ncy5wcm9tcHQoXCLYpdix2LPYp9mEINil2YfZhNin2YZcIiwgXCJcIikudGhlbihyID0+IHtcbiAgICAgICAgaWYoci5yZXN1bHQpeyAvLyBvbiBwcmVzcyBva1xuICAgICAgICAgIC8vIHNlbmQgQWR2ZXJ0aXNpbmdcbiAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIsIHtjbWQ6IFwicG1zZ1wiLCBkYXRhOiB7IG1zZzogci50ZXh0IH19KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25JdGVtVGFwKGV2dCl7XG4gICAgXG4gIH1cblxuICBqb2luUm9vbShldmVudCxyb29taWQpeyAvLyBqb2luIHJvb21cbiAgICAvLyBqb2luIHJvb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb20gaWRcbiAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcInJqb2luXCIsIGRhdGE6IHtpZDogdGhpcy5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IHJvb21pZClbMF0uaWQgfSB9KTtcbiAgfTtcblxuICBzZW5kTWVzc2FnZSgpeyAvLyBzZW5kIG1lc3NhZ2UgdG8gdXNlciByb29tXG4gICAgLy8gZ2V0IG1lc3NhZ2UgaW5wdXRcbiAgICB2YXIgdGV4dGZpZWxkOlRleHRGaWVsZD0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibWVzc2FnZWlucHV0XCIpO1xuICAgIC8vIHdoZW4gdGV4dGZpZWxkIGlzIGJsYW5rIGRvbnQgc2VuZCBhbnl0aGluZ1xuICAgIGlmKHRleHRmaWVsZC50ZXh0LnRyaW0oKSA9PSBcIlwiKSByZXR1cm47XG4gICAgLy8gc2VuZCBtZXNzYWdlXG4gICAgdGhpcy5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJtc2dcIiwgZGF0YToge21zZzogdGV4dGZpZWxkLnRleHR9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzZW5kQnJvYWRjYXN0KCl7IC8vIHNlbmQgYnJvYWRzY2FzdFxuICAgIC8vZ2V0IGJyb2FkY2FzdCBpbnB1dFxuICAgIHZhciB0ZXh0ZmllbGQ6VGV4dEZpZWxkPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJicm9hZGNhc3RpbnB1dFwiKTtcbiAgICAvLyB3aGVuIHRleHRmaWVsZCBpcyBibGFuayBkb250IHNlbmQgYW55dGhpbmdcbiAgICBpZih0ZXh0ZmllbGQudGV4dC50cmltKCkgPT0gXCJcIikgcmV0dXJuO1xuICAgIC8vIHNlbmQgYnJvYWRjYXN0XG4gICAgdGhpcy5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJiY1wiLCBkYXRhOiB7IG1zZzogdGV4dGZpZWxkLnRleHQsIGxpbms6IG51bGwgfSB9KTtcbiAgICAvLyBzZXQgdGV4dGZpZWxkIGJsYW5rXG4gICAgdGV4dGZpZWxkLnRleHQgPSBcIlwiO1xuICB9XG5cbiAgc2VuZEluZm8oKXtcbiAgICAvLyB0aGlzLnVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcigodmFsdWUsaW5kZXgpID0+IHZhbHVlLmlkID09IHRoaXMudXNlcmlkKVswXTtcbiAgICAvLyB0aGlzLnJvb20gPSB0aGlzLnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gdGhpcy51c2VyLnJvb21pZClbMF07XG4gICAgLy9cbiAgICAvLyBhbGVydChKU09OLnN0cmluZ2lmeSh0aGlzLnVzZXIsbnVsbCw0KSArIFwiXFxuXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnJvb20sbnVsbCw0KSk7XG4gIH1cblxuICB1cGRhdGVSb29tcyAocm9vbXM/Okxpc3RWaWV3KXsgLy8gcmVmcmVzaCByb29tIG9ubGluZSB1c2Vyc1xuICAgIGlmKHJvb21zID09IG51bGwpe1xuICAgICAgcm9vbXMgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTsgICAgICBcbiAgICB9XG5cbiAgICB0aGlzLnJvb21zLnNvcnQoKGEsIGIpID0+IGIub25saW5lIC0gYS5vbmxpbmUgKTtcblxuICAgIHRoaXMucm9vbXMuZm9yRWFjaCgoZWxlbWVudCxpbmRleCk9PntcbiAgICAgIHZhciB1c2Vyc1Jvb20gPSB0aGlzLnVzZXJzLmZpbHRlcih2ID0+IHYucm9vbWlkID09IGVsZW1lbnQuaWQpO1xuICAgICAgdGhpcy5yb29tc1tpbmRleF0ub25saW5lID0gdXNlcnNSb29tLmxlbmd0aDtcbiAgICB9KTtcblxuICAgIHJvb21zLnJlZnJlc2goKVxuICAgIFxuICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgIHZhciB0YWJOb3RpZmljYXRpb25zOlRhYlZpZXdJdGVtID0gPFRhYlZpZXdJdGVtPnRoaXMucGFnZS5nZXRWaWV3QnlJZChcInRhYk5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB2YXIgdGFiT25saW5lOlRhYlZpZXdJdGVtID0gPFRhYlZpZXdJdGVtPnRoaXMucGFnZS5nZXRWaWV3QnlJZChcInRhYk9ubGluZXNcIik7XG4gICAgICB0YWJOb3RpZmljYXRpb25zLnRpdGxlID0gXCLYp9mE2KPYtNi52KfYsdin2KogXCIgKyB0aGlzLm5vdGlmaWNhdGlvbnMubGVuZ3RoO1xuICAgICAgdGFiT25saW5lLnRpdGxlID0gXCLYp9mE2YXYqti12YTZitmGIFwiICsgdGhpcy51c2Vycy5sZW5ndGg7XG5cbiAgICAgIHRoaXMudXBkYXRlUm9vbXMocm9vbXMpO1xuICAgIH0sMTAwMCk7XG4gIH1cbn0iXX0=