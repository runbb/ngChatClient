"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var router_2 = require("nativescript-angular/router");
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
    function MainComponent(page, connect, router, routerExtensions) {
        var _this = this;
        this.page = page;
        this.connect = connect;
        this.router = router;
        this.routerExtensions = routerExtensions;
        this.connect.messages = [];
        this.connect.notifications = [];
        this.connect.users = [];
        this.connect.powers = [];
        this.connect.broadcasts = [];
        this.connect.rooms = [];
        this.connect.connected.next(false);
        this.connect.socket.on('msg', function (data) {
            _this.connect.connected.next(true);
            if (typeof data.data === "string" && data.cmd != 'u-') {
                data.data = JSON.parse(unescape(data.data));
            }
            if (data.cmd == "login") {
                switch (data.data.msg) {
                    case "ok":
                        _this.connect.userid = data.data.id;
                        dialogs.alert({
                            title: "تسجيل الدخول",
                            message: 'تم تسجيل الدخول بشكل صحيح',
                            okButtonText: "حسنا"
                        });
                        _this.router.navigate(['main']);
                        break;
                    case "badname":
                        _this.connect.userid = data.data.id;
                        dialogs.alert({
                            title: "تسجيل الدخول",
                            message: 'يرجى إختيار أسم آخر',
                            okButtonText: "حسنا"
                        });
                        _this.routerExtensions.back();
                        _this.connect.socket.disconnect();
                        break;
                    case "usedname":
                        _this.connect.userid = data.data.id;
                        dialogs.alert({
                            title: "التسجيل",
                            message: 'هذا الإسم مسجل من قبل',
                            okButtonText: "حسنا"
                        });
                        _this.routerExtensions.back();
                        _this.connect.socket.disconnect();
                        break;
                    case "badpass":
                        _this.connect.userid = data.data.id;
                        dialogs.alert({
                            title: "التسجيل",
                            message: 'كلمه المرور غير مناسبه',
                            okButtonText: "حسنا"
                        });
                        _this.routerExtensions.back();
                        _this.connect.socket.disconnect();
                        break;
                    case "wrong":
                        _this.connect.userid = data.data.id;
                        dialogs.alert({
                            title: "تسجيل الدخول",
                            message: 'كلمه المرور غير صحيحه',
                            okButtonText: "حسنا"
                        });
                        _this.routerExtensions.back();
                        _this.connect.socket.disconnect();
                        break;
                    case "reg":
                        _this.connect.userid = data.data.id;
                        dialogs.alert({
                            title: "التسجيل",
                            message: 'تم تسجيل العضويه بنجاح !',
                            okButtonText: "حسنا"
                        });
                        break;
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
                try {
                    messages.refresh();
                    if (messages.ios) {
                        messages.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(_this.connect.messages.length - 1, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                    }
                    else {
                        messages.scrollToIndex(_this.connect.messages.length - 1);
                    }
                }
                catch (e) { }
            }
            if (data.cmd == "not") {
                var notifications = _this.page.getViewById("listNotifications");
                var user = _this.connect.users.filter(function (value) { return value.id == data.data.user; })[0] || { pic: "" };
                _this.connect.notifications.unshift(new Notification(_this.connect.server + user.pic, _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
                try {
                    notifications.refresh();
                }
                catch (e) { }
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
                try {
                    onlines.refresh();
                }
                catch (e) { }
                _this.updateUsers(onlines);
            }
            if (data.cmd == "u-") {
                var onlines = _this.page.getViewById("listOnline");
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.users.splice(_this.connect.users.indexOf(_this.connect.users.filter(function (v) { return v.id == data.data; })[0]), 1);
                try {
                    onlines.refresh();
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
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
                try {
                    onlines.refresh();
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
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
                try {
                    onlines.refresh();
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
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
                try {
                    onlines.refresh();
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
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
                try {
                    broadcasts.refresh();
                    if (broadcasts.ios) {
                        broadcasts.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(0, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                    }
                    else {
                        broadcasts.scrollToIndex(0);
                    }
                }
                catch (e) { }
            }
            if (data.cmd == "rlist") {
                var rooms = _this.page.getViewById("listRooms");
                data.data.forEach(function (element) {
                    element.online = 0;
                    _this.connect.rooms.push(element);
                });
                try {
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
            }
            if (data.cmd == "r+") {
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.rooms.push(data.data);
                try {
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
            }
            if (data.cmd == "r-") {
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.rooms.splice(_this.connect.rooms.indexOf(_this.connect.rooms.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                try {
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
            }
            if (data.cmd == "r^") {
                var rooms = _this.page.getViewById("listRooms");
                _this.connect.rooms.splice(_this.connect.rooms.indexOf(_this.connect.rooms.filter(function (v) { return v.id == data.data.id; })[0]), 1);
                _this.connect.rooms.push(data.data);
                try {
                    rooms.refresh();
                    _this.updateRooms(rooms);
                }
                catch (e) { }
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
            dialogs.alert({
                title: "خطأ",
                message: 'اوه لا !! انقطع الاتصال',
                okButtonText: 'حسنا'
            });
            _this.routerExtensions.back();
            _this.connect.socket.disconnect();
            try {
                notifications.refresh();
            }
            catch (e) { }
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
            dialogs.alert({
                title: "خطأ",
                message: 'اوه لا !! خطأ في الاتصال',
                okButtonText: 'حسنا'
            });
            _this.routerExtensions.back();
            _this.connect.socket.disconnect();
            try {
                notifications.refresh();
            }
            catch (e) { }
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
            dialogs.alert({
                title: "خطأ",
                message: 'اوه لا !! لا يمكنني الاتصال بالخادم',
                okButtonText: 'حسنا'
            });
            _this.routerExtensions.back();
            _this.connect.socket.disconnect();
            try {
                notifications.refresh();
            }
            catch (e) { }
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
            dialogs.alert({
                title: "خطأ",
                message: 'انا اقوم باعادة الاتصال بالخادم الان',
                okButtonText: 'حسنا'
            });
            _this.routerExtensions.back();
            _this.connect.socket.disconnect();
            try {
                notifications.refresh();
            }
            catch (e) { }
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
            dialogs.alert({
                title: "خطأ",
                message: 'اوه لا !! حدث خطأ ما',
                okButtonText: 'حسنا'
            });
            _this.routerExtensions.back();
            _this.connect.socket.disconnect();
            try {
                notifications.refresh();
            }
            catch (e) { }
        });
    }
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
        var _this = this;
        if (typeof id != "string") {
            dialogs.action({
                cancelable: true,
                cancelButtonText: "الغاء",
                title: this.connect.user.topic,
                actions: [
                    'معلوماتي',
                    'تسجيل الخروج'
                ]
            }).then(function (result) {
                if (result == 'معلوماتي') {
                    alert(JSON.stringify(_this.connect.user, null, 4));
                }
                else if (result == 'تسجيل الخروج') {
                    _this.connect.socket.emit('msg', { cmd: 'logout', data: {} });
                }
            });
        }
        else {
            var user = this.connect.users.filter(function (v) { return v.id == id; })[0];
            var room;
            if (user) {
                room = this.connect.rooms.filter(function (v) { return v.id == user.roomid; })[0];
            }
            else {
                room = this.connect.rooms[0];
            }
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
        try {
            rooms.refresh();
        }
        catch (e) { }
    };
    MainComponent.prototype.updateUsers = function (users) {
        var _this = this;
        if (users == null) {
            users = this.page.getViewById("listOnline");
        }
        this.connect.user = this.connect.users.filter(function (value, index) { return value.id == _this.connect.userid; })[0];
        if (this.connect.user) {
            this.connect.room = this.connect.rooms.filter(function (v) { return v.id == _this.connect.user.roomid; })[0];
        }
        if (this.connect.user) {
            var useravatar = this.page.getViewById("userAvatar");
            var usertopic = this.page.getViewById("userTopic");
            useravatar.src = this.connect.server + this.connect.user.pic;
            usertopic.text = this.connect.user.topic;
        }
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
        try {
            users.refresh();
        }
        catch (e) { }
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
    __metadata("design:paramtypes", [page_1.Page, connection_1.Connection, router_1.Router, router_2.RouterExtensions])
], MainComponent);
exports.MainComponent = MainComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYWluLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUEwQztBQUMxQywwQ0FBeUM7QUFDekMsc0RBQThEO0FBRTlELGdDQUErQjtBQU0vQiwrQkFBa0Q7QUFDbEQsb0RBQW1EO0FBS25ELG9DQUF1QztBQUN2Qyw4QkFBaUM7QUFJakM7SUFDRSxpQkFBbUIsRUFBUyxFQUFTLE1BQWEsRUFBUyxLQUFZLEVBQVEsR0FBVSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQy9HLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFFBQUcsR0FBSCxHQUFHLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztRQUMvRyxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLGlCQUFZLEdBQVosWUFBWSxDQUFPO0lBQUUsQ0FBQztJQUN4RixjQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUNFLHNCQUFtQixLQUFZLEVBQVEsT0FBYztRQUFsQyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFFLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUVELG1CQUFtQixJQUFXO0lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQU1ELElBQWEsYUFBYTtJQUN4Qix1QkFBbUIsSUFBUyxFQUFVLE9BQWtCLEVBQVMsTUFBYSxFQUFTLGdCQUFrQztRQUF6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QyxJQUFJLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUssU0FBUyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSyxTQUFTLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUMsRUFBRSxDQUFDLENBQUM7Z0JBR3JELEVBQUUsQ0FBQSxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUN2QyxLQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDaEMsQ0FBQztnQkFFRCxLQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFB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T0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUMxSSxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRXhDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBRyxDQUFDO1lBQ0YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2pCLENBQUM7UUFBQSxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQztRQUVYLGtCQUFVLENBQUM7WUFDVCxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNWLENBQUM7SUFHRCxtQ0FBVyxHQUFYO1FBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUFuc0JELElBbXNCQztBQW5zQlksYUFBYTtJQUp6QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLHFCQUFxQjtLQUNuQyxDQUFDO3FDQUV3QixXQUFJLEVBQWtCLHVCQUFVLEVBQWdCLGVBQU0sRUFBMkIseUJBQWdCO0dBRDlHLGFBQWEsQ0Ftc0J6QjtBQW5zQlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXJcIlxuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgTGlzdFZpZXcgfSBmcm9tIFwidWkvbGlzdC12aWV3XCI7XG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwidWkvdGV4dC1maWVsZFwiO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tIFwidWkvaW1hZ2VcIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJ1aS9idXR0b25cIjtcbmltcG9ydCB7IFRhYlZpZXdJdGVtIH0gZnJvbSBcInVpL3RhYi12aWV3XCI7XG5pbXBvcnQgeyBzZXRUaW1lb3V0ICwgY2xlYXJUaW1lb3V0IH0gZnJvbSAndGltZXInO1xuaW1wb3J0IHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL3NlcnZpY2VzL2Nvbm5lY3Rpb25cIjtcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcImFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tIFwicGxhdGZvcm1cIjtcblxuaW1wb3J0IGRpYWxvZ3MgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcbmltcG9ydCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmVcIik7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5mdW5jdGlvbiBfdW5lc2NhcGUoY29kZTpzdHJpbmcpOiBzdHJpbmd7XG4gIHJldHVybiBfLnVuZXNjYXBlKGNvZGUpLnJlcGxhY2UoLyYjeDNDOy8sJzwnKTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICB0ZW1wbGF0ZVVybDogJ21haW4uY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIE1haW5Db21wb25lbnR7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYWdlOlBhZ2UsIHByaXZhdGUgY29ubmVjdDpDb25uZWN0aW9uLCBwdWJsaWMgcm91dGVyOlJvdXRlcixwcml2YXRlIHJvdXRlckV4dGVuc2lvbnM6IFJvdXRlckV4dGVuc2lvbnMpe1xuICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zID0gW107XG4gICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IFtdO1xuICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107XG4gICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcblxuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ21zZycsIChkYXRhKSA9PiB7XG4gICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQodHJ1ZSk7XG5cbiAgICAgIGlmKHR5cGVvZiBkYXRhLmRhdGEgPT09IFwic3RyaW5nXCIgJiYgZGF0YS5jbWQgIT0gJ3UtJyl7XG4gICAgICAgICAgZGF0YS5kYXRhID0gSlNPTi5wYXJzZSh1bmVzY2FwZShkYXRhLmRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJsb2dpblwiKXsgLy8gb24gbG9naW4gdG8gc2VydmVyXG4gICAgICAgIHN3aXRjaChkYXRhLmRhdGEubXNnKXtcbiAgICAgICAgICBjYXNlIFwib2tcIjpcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC51c2VyaWQgPSBkYXRhLmRhdGEuaWQ7XG4gICAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwi2KrYs9is2YrZhCDYp9mE2K/YrtmI2YRcIixcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ9iq2YUg2KrYs9is2YrZhCDYp9mE2K/YrtmI2YQg2KjYtNmD2YQg2LXYrdmK2K0nLFxuICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwi2K3Ys9mG2KdcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ21haW4nXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImJhZG5hbWVcIjpcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC51c2VyaWQgPSBkYXRhLmRhdGEuaWQ7XG4gICAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwi2KrYs9is2YrZhCDYp9mE2K/YrtmI2YRcIixcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ9mK2LHYrNmJINil2K7YqtmK2KfYsSDYo9iz2YUg2KLYrtixJyxcbiAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcItit2LPZhtinXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInVzZWRuYW1lXCI6XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcItin2YTYqtiz2KzZitmEXCIsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICfZh9iw2Kcg2KfZhNil2LPZhSDZhdiz2KzZhCDZhdmGINmC2KjZhCcsXG4gICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogXCLYrdiz2YbYp1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmRpc2Nvbm5lY3QoKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJiYWRwYXNzXCI6XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcItin2YTYqtiz2KzZitmEXCIsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICfZg9mE2YXZhyDYp9mE2YXYsdmI2LEg2LrZitixINmF2YbYp9iz2KjZhycsXG4gICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogXCLYrdiz2YbYp1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmRpc2Nvbm5lY3QoKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJ3cm9uZ1wiOlxuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJpZCA9IGRhdGEuZGF0YS5pZDtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogXCLYqtiz2KzZitmEINin2YTYr9iu2YjZhFwiLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAn2YPZhNmF2Ycg2KfZhNmF2LHZiNixINi62YrYsSDYtdit2YrYrdmHJyxcbiAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcItit2LPZhtinXCIgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5kaXNjb25uZWN0KClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwicmVnXCI6XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcItin2YTYqtiz2KzZitmEXCIsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICfYqtmFINiq2LPYrNmK2YQg2KfZhNi52LbZiNmK2Ycg2KjZhtis2KfYrSAhJyxcbiAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcItit2LPZhtinXCIgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJtc2dcIil7IC8vIHJvb20gbWVzc2FnZSBcbiAgICAgICAgdmFyIG1lc3NhZ2VzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0TWVzc2FnZXNcIik7XG4gICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudWlkKVswXTtcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGEuaWNvID0gKHVzZXIgfHwge2ljbzonJ30pLmljbyB8fCAnJztcblxuICAgICAgICBpZihkYXRhLmRhdGEuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLnVjb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS51Y29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZih0aGlzLmNvbm5lY3QubWVzc2FnZXMubGVuZ3RoID4gMTAwKXtcbiAgICAgICAgICB0aGlzLmNvbm5lY3QubWVzc2FnZXMuc2hpZnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcy5wdXNoKCBuZXcgTWVzc2FnZSgodXNlciB8fCB7aWQ6IFwiXCJ9KS5pZCAsdGhpcy5jb25uZWN0LnNlcnZlciArIGRhdGEuZGF0YS5waWMsIHNpY28sIGRhdGEuZGF0YS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnLCBfdW5lc2NhcGUoZGF0YS5kYXRhLnRvcGljKSwgX3VuZXNjYXBlKGRhdGEuZGF0YS5tc2cucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZGF0YS5kYXRhLmJnLCBkYXRhLmRhdGEudWNvbCwgZGF0YS5kYXRhLm1jb2wpICk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBtZXNzYWdlcy5yZWZyZXNoKCk7ICBcbiAgICAgICAgICBpZiAobWVzc2FnZXMuaW9zKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2VzLmlvcy5zY3JvbGxUb1Jvd0F0SW5kZXhQYXRoQXRTY3JvbGxQb3NpdGlvbkFuaW1hdGVkKFxuICAgICAgICAgICAgICAgICAgTlNJbmRleFBhdGguaW5kZXhQYXRoRm9ySXRlbUluU2VjdGlvbih0aGlzLmNvbm5lY3QubWVzc2FnZXMubGVuZ3RoLTEsIDApLFxuICAgICAgICAgICAgICAgICAgVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbi5VSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uVG9wLFxuICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZXMuc2Nyb2xsVG9JbmRleCh0aGlzLmNvbm5lY3QubWVzc2FnZXMubGVuZ3RoLTEpOyBcbiAgICAgICAgICB9XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmNtZCA9PSBcIm5vdFwiKXsgLy8gbm90aWZpY2F0aW9uc1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudXNlcilbMF0gfHwgeyBwaWM6IFwiXCIgfTtcbiAgICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyB1c2VyLnBpYyxfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpKSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1bGlzdFwiKXsgLy8gdXNlcnMgb25saW5lXG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gZWxlbWVudC5wb3dlcjtcbiAgICAgICAgICB9KVswXTtcblxuICAgICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICAgIHNpY28gPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgICAgZWxlbWVudC5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50LnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihlbGVtZW50Lm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgICAgZWxlbWVudC5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGVsZW1lbnQuaWNvID0gKGVsZW1lbnQgfHwge2ljbzonJ30pLmljbyB8fCAnJztcblxuICAgICAgICAgIGVsZW1lbnQuYmcgICAgPSBlbGVtZW50LmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgICBlbGVtZW50LmJnICAgID0gZWxlbWVudC5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICAgIGVsZW1lbnQudWNvbCAgPSBlbGVtZW50LnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgICBlbGVtZW50LnVjb2wgID0gZWxlbWVudC51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgICAgZWxlbWVudC5tY29sICA9IGVsZW1lbnQubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICAgIGVsZW1lbnQubWNvbCAgPSBlbGVtZW50Lm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcblxuICAgICAgICAgIGVsZW1lbnQuc2ljbyAgPSBzaWNvO1xuXG4gICAgICAgICAgZGF0YS5kYXRhLmRpY28gPSBkYXRhLmRhdGEuaWNvICE9ICcnID8gdGhpcy5jb25uZWN0LnNlcnZlciArIFwiZHJvMy9cIiArIGRhdGEuZGF0YS5pY28gOiAnJztcblxuICAgICAgICAgIHRoaXMuY29ubmVjdC51c2Vycy5wdXNoKGVsZW1lbnQpOyAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgICAgdGhpcy51cGRhdGVVc2VycyhvbmxpbmVzKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1LVwiKXsgLy8gdXNlciBsZWZ0XG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJzLnNwbGljZSh0aGlzLmNvbm5lY3QudXNlcnMuaW5kZXhPZih0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEpWzBdKSwgMSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidStcIil7IC8vIHVzZXIgam9pblxuICAgICAgICB2YXIgb25saW5lczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE9ubGluZVwiKTtcbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIFxuICAgICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLmNvbm5lY3QucG93ZXJzLmZpbHRlcih2YWx1ZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSBkYXRhLmRhdGEucG93ZXI7XG4gICAgICAgIH0pWzBdO1xuXG4gICAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgICAgc2ljbyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmljbyA9IChkYXRhLmRhdGEgfHwge2ljbzonJ30pLmljbyB8fCAnJzsgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLmJnID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEuYmcgPSBcIiNGRkZGRkZcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5tY29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgICB8fCAnI0ZGRkZGRic7XG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZy5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuXG4gICAgICAgIGRhdGEuZGF0YS5kaWNvID0gZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJyc7XG5cbiAgICAgICAgZGF0YS5kYXRhLnNpY28gID0gc2ljbztcbiAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJzLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1XlwiKXsgLy8gdXNlciBlZGl0XG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJzLnNwbGljZSh0aGlzLmNvbm5lY3QudXNlcnMuaW5kZXhPZih0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IGRhdGEuZGF0YS5wb3dlcjtcbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5jb25uZWN0LnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuaWNvID0gKGRhdGEuZGF0YSB8fCB7aWNvOicnfSkuaWNvIHx8ICcnOyAgICAgICAgICAgICAgICBcblxuICAgICAgICBpZihkYXRhLmRhdGEuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLnVjb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS51Y29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG5cbiAgICAgICAgZGF0YS5kYXRhLmRpY28gPSBkYXRhLmRhdGEuaWNvICE9ICcnID8gdGhpcy5jb25uZWN0LnNlcnZlciArIFwiZHJvMy9cIiArIGRhdGEuZGF0YS5pY28gOiAnJztcblxuICAgICAgICBkYXRhLmRhdGEuc2ljbyAgPSBzaWNvO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdC51c2Vycy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwidXJcIil7IC8vIHVzZXIgam9pbiByb29tXG4gICAgICAgIGlmKHRoaXMuY29ubmVjdC5yb29tcyA9PSBbXSB8fCB0aGlzLmNvbm5lY3QudXNlcnMgPT0gW10pe1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLmNvbm5lY3QudXNlcnNbdGhpcy5jb25uZWN0LnVzZXJzLmluZGV4T2YodGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2ID0+IHYuaWQgPT0gZGF0YS5kYXRhWzBdKVswXSldO1xuICAgICAgICBpZiAodXNlciA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHVzZXIgPSB7XG4gICAgICAgICAgICByb29taWQ6ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVzZXIucm9vbWlkID0gZGF0YS5kYXRhWzFdO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlUm9vbXMocm9vbXMpO1xuICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInBvd2Vyc1wiKXsgLy8gcG93ZXJzXG4gICAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnMgPSBkYXRhLmRhdGE7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPCB0aGlzLmNvbm5lY3QucG93ZXJzLmxlbmd0aDtpKyspXG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgcG5hbWU9IHRoaXMuY29ubmVjdC5wb3dlcnNbaV0ubmFtZTtcbiAgICAgICAgICBpZihwbmFtZT09Jycpe1xuICAgICAgICAgICAgICBwbmFtZT0nXyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jb25uZWN0LnBvd2Vyc1twbmFtZV0gPSB0aGlzLmNvbm5lY3QucG93ZXJzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09ICdiYycpeyAvLyBicm9hZGNhc3RcbiAgICAgICAgdmFyIGJyb2FkY2FzdHM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RCcm9hZGNhc3RcIik7XG4gICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudWlkKVswXTtcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5jb25uZWN0LnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuaWNvID0gKHVzZXIgfHwge2ljbzonJ30pLmljbyB8fCAnJztcblxuICAgICAgICBpZihkYXRhLmRhdGEuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLnVjb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLm1jb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZih0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cy5sZW5ndGggPiAxMDApe1xuICAgICAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzLnBvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMudW5zaGlmdCggbmV3IE1lc3NhZ2UoKHVzZXIgfHwge2lkOiBcIlwifSkuaWQgLCB0aGlzLmNvbm5lY3Quc2VydmVyICsgZGF0YS5kYXRhLnBpYywgc2ljbywgZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJycsIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcblxuICAgICAgICB0cnl7XG4gICAgICAgICAgYnJvYWRjYXN0cy5yZWZyZXNoKCk7XG4gICAgICAgICAgaWYgKGJyb2FkY2FzdHMuaW9zKSB7XG4gICAgICAgICAgICAgIGJyb2FkY2FzdHMuaW9zLnNjcm9sbFRvUm93QXRJbmRleFBhdGhBdFNjcm9sbFBvc2l0aW9uQW5pbWF0ZWQoXG4gICAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKDAsIDApLFxuICAgICAgICAgICAgICAgICAgVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbi5VSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uVG9wLFxuICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgYnJvYWRjYXN0cy5zY3JvbGxUb0luZGV4KDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJybGlzdFwiKXsgLy8gcm9vbXMgbGlzdFxuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgZGF0YS5kYXRhLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgZWxlbWVudC5vbmxpbmUgPSAwO1xuICAgICAgICAgIHRoaXMuY29ubmVjdC5yb29tcy5wdXNoKGVsZW1lbnQpOyAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicitcIil7IC8vIGFkZCByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlUm9vbXMocm9vbXMpO1xuICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInItXCIpeyAvLyByZW1vdmUgcm9vbVxuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnJvb21zLnNwbGljZSh0aGlzLmNvbm5lY3Qucm9vbXMuaW5kZXhPZih0aGlzLmNvbm5lY3Qucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicl5cIil7IC8vIHJvb20gZWRpdFxuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnJvb21zLnNwbGljZSh0aGlzLmNvbm5lY3Qucm9vbXMuaW5kZXhPZih0aGlzLmNvbm5lY3Qucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGEuaWQpWzBdKSwgMSk7XG4gICAgICAgIHRoaXMuY29ubmVjdC5yb29tcy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG4gICAgICBcbiAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YjZhyDZhNinICEhINin2YbZgti32Lkg2KfZhNin2KrYtdin2YQnKSk7XG5cbiAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICB0aXRsZTogXCLYrti32KNcIixcbiAgICAgICAgbWVzc2FnZTogJ9in2YjZhyDZhNinICEhINin2YbZgti32Lkg2KfZhNin2KrYtdin2YQnLFxuICAgICAgICBva0J1dHRvblRleHQ6ICfYrdiz2YbYpydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG5cbiAgICAgIHRyeXtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH0pO1xuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Nvbm5lY3RfZXJyb3InLCAoZGF0YSkgPT4geyAgICAgIFxuICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcblxuICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2K7Yt9ijINmB2Yog2KfZhNin2KrYtdin2YQnKSk7XG5cbiAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICB0aXRsZTogXCLYrti32KNcIixcbiAgICAgICAgbWVzc2FnZTogJ9in2YjZhyDZhNinICEhINiu2LfYoyDZgdmKINin2YTYp9iq2LXYp9mEJyxcbiAgICAgICAgb2tCdXR0b25UZXh0OiAn2K3Ys9mG2KcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmRpc2Nvbm5lY3QoKVxuXG4gICAgICB0cnl7XG4gICAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpOyAgXG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH0pO1xuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Nvbm5lY3RfdGltZW91dCcsIChkYXRhKSA9PiB7ICAgICAgIFxuICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcblxuICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2YTYpyDZitmF2YPZhtmG2Yog2KfZhNin2KrYtdin2YQg2KjYp9mE2K7Yp9iv2YUnKSk7XG5cbiAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICB0aXRsZTogXCLYrti32KNcIixcbiAgICAgICAgbWVzc2FnZTogJ9in2YjZhyDZhNinICEhINmE2Kcg2YrZhdmD2YbZhtmKINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFJyxcbiAgICAgICAgb2tCdXR0b25UZXh0OiAn2K3Ys9mG2KcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmRpc2Nvbm5lY3QoKSAgICAgIFxuXG4gICAgICB0cnl7XG4gICAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgICAgfWNhdGNoKGUpe31cbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdyZWNvbm5lY3RfYXR0ZW1wdCcsIChkYXRhKSA9PiB7ICAgICAgXG4gICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuXG4gICAgICB0aGlzLmNvbm5lY3QubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdOyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLmNvbm5lY3Quc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mG2Kcg2KfZgtmI2YUg2KjYp9i52KfYr9ipINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFINin2YTYp9mGJykpO1xuXG4gICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgdGl0bGU6IFwi2K7Yt9ijXCIsXG4gICAgICAgIG1lc3NhZ2U6ICfYp9mG2Kcg2KfZgtmI2YUg2KjYp9i52KfYr9ipINin2YTYp9iq2LXYp9mEINio2KfZhNiu2KfYr9mFINin2YTYp9mGJyxcbiAgICAgICAgb2tCdXR0b25UZXh0OiAn2K3Ys9mG2KcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmRpc2Nvbm5lY3QoKVxuXG4gICAgICB0cnl7XG4gICAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgICAgfWNhdGNoKGUpe31cbiAgICB9KTtcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdlcnJvcicsIChkYXRhKSA9PiB7IFxuICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcblxuICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2K3Yr9irINiu2LfYoyDZhdinJykpO1xuXG4gICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgdGl0bGU6IFwi2K7Yt9ijXCIsXG4gICAgICAgIG1lc3NhZ2U6ICfYp9mI2Ycg2YTYpyAhISDYrdiv2Ksg2K7Yt9ijINmF2KcnLFxuICAgICAgICBva0J1dHRvblRleHQ6ICfYrdiz2YbYpydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG5cbiAgICAgIHRyeXtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH0pO1xuXG4gIH1cblxuICBzZW5kQWR2ZXJ0aXNpbmcoKXtcbiAgICBkaWFsb2dzLnByb21wdCh7XG4gICAgICB0aXRsZTogXCLYp9ix2LPYp9mEINin2YTYp9i52YTYp9mGXCIsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgbWVzc2FnZTogXCLYp9iv2K7ZhCDZhti1INin2YTYp9i52YTYp9mGXCIsXG4gICAgICBjYW5jZWxCdXR0b25UZXh0OiBcItin2YTYutin2KFcIixcbiAgICAgIG9rQnV0dG9uVGV4dDogXCLYp9ix2LPYp9mEXCJcbiAgICB9KS50aGVuKHIgPT4ge1xuICAgICAgICBpZihyLnJlc3VsdCl7IC8vIG9uIHByZXNzIG9rXG4gICAgICAgICAgLy8gc2VuZCBBZHZlcnRpc2luZ1xuICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdChcIm1zZ1wiLCB7Y21kOiBcInBtc2dcIiwgZGF0YTogeyBtc2c6IHIudGV4dCB9fSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uSXRlbVRhcChldnQpe1xuICAgIFxuICB9XG5cbiAgam9pblJvb20oZXZlbnQscm9vbWlkKXsgLy8gam9pbiByb29tXG4gICAgLy8gam9pbiByb29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tIGlkXG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcInJqb2luXCIsIGRhdGE6IHtpZDogdGhpcy5jb25uZWN0LnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gcm9vbWlkKVswXS5pZCB9IH0pO1xuICB9O1xuXG4gIHNlbmRNZXNzYWdlKCl7IC8vIHNlbmQgbWVzc2FnZSB0byB1c2VyIHJvb21cbiAgICAvLyBnZXQgbWVzc2FnZSBpbnB1dFxuICAgIHZhciB0ZXh0ZmllbGQ6VGV4dEZpZWxkPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJtZXNzYWdlaW5wdXRcIik7XG4gICAgLy8gd2hlbiB0ZXh0ZmllbGQgaXMgYmxhbmsgZG9udCBzZW5kIGFueXRoaW5nXG4gICAgaWYodGV4dGZpZWxkLnRleHQudHJpbSgpID09IFwiXCIpIHJldHVybjtcbiAgICAvLyBzZW5kIG1lc3NhZ2VcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmVtaXQoXCJtc2dcIix7Y21kOlwibXNnXCIsIGRhdGE6IHttc2c6IHRleHRmaWVsZC50ZXh0fSB9KTtcbiAgICAvLyBzZXQgdGV4dGZpZWxkIGJsYW5rXG4gICAgdGV4dGZpZWxkLnRleHQgPSBcIlwiO1xuICB9XG5cbiAgc2VuZEJyb2FkY2FzdCgpeyAvLyBzZW5kIGJyb2Fkc2Nhc3RcbiAgICAvL2dldCBicm9hZGNhc3QgaW5wdXRcbiAgICB2YXIgdGV4dGZpZWxkOlRleHRGaWVsZD0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwiYnJvYWRjYXN0aW5wdXRcIik7XG4gICAgLy8gd2hlbiB0ZXh0ZmllbGQgaXMgYmxhbmsgZG9udCBzZW5kIGFueXRoaW5nXG4gICAgaWYodGV4dGZpZWxkLnRleHQudHJpbSgpID09IFwiXCIpIHJldHVybjtcbiAgICAvLyBzZW5kIGJyb2FkY2FzdFxuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJiY1wiLCBkYXRhOiB7IG1zZzogdGV4dGZpZWxkLnRleHQsIGxpbms6IG51bGwgfSB9KTtcbiAgICAvLyBzZXQgdGV4dGZpZWxkIGJsYW5rXG4gICAgdGV4dGZpZWxkLnRleHQgPSBcIlwiO1xuICB9XG5cbiAgc2hvd0luZm8oaWQ/OnN0cmluZyl7IC8vIHNob3cgdXNlciBpbmZvcm1hdGlvblxuICAgIGlmKHR5cGVvZiBpZCAhPSBcInN0cmluZ1wiKXtcbiAgICAgICAgZGlhbG9ncy5hY3Rpb24oe1xuICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogXCLYp9mE2LrYp9ihXCIsXG4gICAgICAgICAgdGl0bGU6IHRoaXMuY29ubmVjdC51c2VyLnRvcGljLFxuICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICfZhdi52YTZiNmF2KfYqtmKJyxcbiAgICAgICAgICAgICfYqtiz2KzZitmEINin2YTYrtix2YjYrCdcbiAgICAgICAgICBdXG4gICAgICAgIH0pLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICBpZihyZXN1bHQgPT0gJ9mF2LnZhNmI2YXYp9iq2YonKXtcbiAgICAgICAgICAgIGFsZXJ0KEpTT04uc3RyaW5naWZ5KHRoaXMuY29ubmVjdC51c2VyLG51bGwsNCkpO1xuICAgICAgICAgIH1lbHNlIGlmKHJlc3VsdCA9PSAn2KrYs9is2YrZhCDYp9mE2K7YsdmI2KwnKXtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdCgnbXNnJywge2NtZDogJ2xvZ291dCcsIGRhdGE6IHt9fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodj0+IHYuaWQgPT0gaWQpWzBdO1xuICAgICAgICB2YXIgcm9vbTtcbiAgICAgICAgaWYodXNlcil7XG4gICAgICAgICAgcm9vbSA9IHRoaXMuY29ubmVjdC5yb29tcy5maWx0ZXIodj0+IHYuaWQgPT0gdXNlci5yb29taWQpWzBdO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByb29tID0gdGhpcy5jb25uZWN0LnJvb21zWzBdOyAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHVzZXIgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgIHRpdGxlOiBcItiq2YbYqNmK2YdcIixcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwi2KfZhNi52LbZiCDYutmK2LEg2YXZiNis2YjYryDYp9mE2KfZhlwiXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhbGVydChKU09OLnN0cmluZ2lmeSh1c2VyLG51bGwsNCkgKyBcbiAgICAgICAgXCJcXG5cIiArIFxuICAgICAgICBKU09OLnN0cmluZ2lmeShyb29tLG51bGwsNCkpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVJvb21zIChyb29tcz86TGlzdFZpZXcpeyAvLyByZWZyZXNoIHJvb20gb25saW5lIHVzZXJzXG4gICAgaWYocm9vbXMgPT0gbnVsbCl7XG4gICAgICByb29tcyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpOyAgICAgIFxuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdC5yb29tcy5zb3J0KChhLCBiKSA9PiBiLm9ubGluZSAtIGEub25saW5lICk7XG5cbiAgICB0aGlzLmNvbm5lY3Qucm9vbXMuZm9yRWFjaCgoZWxlbWVudCxpbmRleCk9PntcbiAgICAgIHZhciB1c2Vyc1Jvb20gPSB0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHYgPT4gdi5yb29taWQgPT0gZWxlbWVudC5pZCk7XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXNbaW5kZXhdLm9ubGluZSA9IHVzZXJzUm9vbS5sZW5ndGg7XG4gICAgfSk7XG5cbiAgICB0cnl7XG4gICAgICByb29tcy5yZWZyZXNoKClcbiAgICB9Y2F0Y2goZSl7fVxuICB9XG5cbiAgdXBkYXRlVXNlcnMgKHVzZXJzPzpMaXN0Vmlldyl7IC8vIHJlZnJlc2ggcm9vbSBvbmxpbmUgdXNlcnNcbiAgICBpZih1c2VycyA9PSBudWxsKXtcbiAgICAgIHVzZXJzID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpOyAgICAgIFxuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdC51c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcigodmFsdWUsaW5kZXgpID0+IHZhbHVlLmlkID09IHRoaXMuY29ubmVjdC51c2VyaWQpWzBdO1xuICAgIGlmKHRoaXMuY29ubmVjdC51c2VyKXtcbiAgICAgIHRoaXMuY29ubmVjdC5yb29tID0gdGhpcy5jb25uZWN0LnJvb21zLmZpbHRlcih2ID0+IHYuaWQgPT0gdGhpcy5jb25uZWN0LnVzZXIucm9vbWlkKVswXTtcbiAgICB9XG4gICAgaWYodGhpcy5jb25uZWN0LnVzZXIpe1xuICAgICAgdmFyIHVzZXJhdmF0YXI6SW1hZ2UgPSA8SW1hZ2U+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInVzZXJBdmF0YXJcIik7XG4gICAgICB2YXIgdXNlcnRvcGljOkJ1dHRvbiA9IDxCdXR0b24+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInVzZXJUb3BpY1wiKTtcblxuICAgICAgdXNlcmF2YXRhci5zcmMgPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgdGhpcy5jb25uZWN0LnVzZXIucGljO1xuICAgICAgdXNlcnRvcGljLnRleHQgPSB0aGlzLmNvbm5lY3QudXNlci50b3BpYztcbiAgICB9XG5cbiAgICB0aGlzLmNvbm5lY3QudXNlcnMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYoYi5yZXAgPT0gdW5kZWZpbmVkIHx8IGIucmVwID09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiLnJlcCAtIGEucmVwO1xuICAgIH0gKTtcblxuICAgIHRoaXMuY29ubmVjdC51c2Vycy5mb3JFYWNoKChlbGVtZW50LGluZGV4KT0+e1xuICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdLnBvd2VyO1xuICAgICAgfSlbMF07XG5cbiAgICAgIGlmKHBvd2VyKXtcbiAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICBzaWNvID0gdGhpcy5jb25uZWN0LnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5pY28gPSAodGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XSB8fCB7aWNvOicnfSkuaWNvIHx8ICcnO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5kaWNvID0gdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5pY28gOiAnJztcbiAgICAgIHRoaXMuY29ubmVjdC51c2Vyc1tpbmRleF0uc2ljbyA9IHNpY287XG5cbiAgICB9KTtcblxuICAgIHRyeXtcbiAgICAgIHVzZXJzLnJlZnJlc2goKVxuICAgIH1jYXRjaChlKXt9XG5cbiAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICB0aGlzLnVwZGF0ZVVzZXJzKHVzZXJzKTtcbiAgICB9LDEwMDApO1xuICB9XG5cblxuICBzaG93UHJpdmF0ZSgpe1xuICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsncHJpdmF0ZSddKTtcbiAgfVxufSJdfQ==