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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYWluLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUEwQztBQUMxQywwQ0FBeUM7QUFDekMsc0RBQThEO0FBRTlELGdDQUErQjtBQU0vQiwrQkFBa0Q7QUFHbEQsb0RBQW1EO0FBS25ELG9DQUF1QztBQUN2Qyw4QkFBaUM7QUFJakM7SUFDRSxpQkFBbUIsRUFBUyxFQUFTLE1BQWEsRUFBUyxLQUFZLEVBQVEsR0FBVSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQy9HLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFFBQUcsR0FBSCxHQUFHLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztRQUMvRyxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLGlCQUFZLEdBQVosWUFBWSxDQUFPO0lBQUUsQ0FBQztJQUN4RixjQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUNFLHNCQUFtQixLQUFZLEVBQVEsT0FBYztRQUFsQyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFFLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQUVELG1CQUFtQixJQUFXO0lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQU1ELElBQWEsYUFBYTtJQUN4Qix1QkFBbUIsSUFBUyxFQUFVLE9BQWtCLEVBQVMsTUFBYSxFQUFTLGdCQUFrQztRQUF6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QyxJQUFJLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUssU0FBUyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSyxTQUFTLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUMsRUFBRSxDQUFDLENBQUM7Z0JBR3JELEVBQUUsQ0FBQSxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUN2QyxLQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDaEMsQ0FBQztnQkFFRCxLQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFB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T0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUMxSSxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRXhDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBRyxDQUFDO1lBQ0YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2pCLENBQUM7UUFBQSxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQztRQUVYLGtCQUFVLENBQUM7WUFDVCxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNWLENBQUM7SUFHRCxtQ0FBVyxHQUFYO1FBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUFuc0JELElBbXNCQztBQW5zQlksYUFBYTtJQUp6QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLHFCQUFxQjtLQUNuQyxDQUFDO3FDQUV3QixXQUFJLEVBQWtCLHVCQUFVLEVBQWdCLGVBQU0sRUFBMkIseUJBQWdCO0dBRDlHLGFBQWEsQ0Ftc0J6QjtBQW5zQlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXJcIlxuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgTGlzdFZpZXcgfSBmcm9tIFwidWkvbGlzdC12aWV3XCI7XG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwidWkvdGV4dC1maWVsZFwiO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tIFwidWkvaW1hZ2VcIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJ1aS9idXR0b25cIjtcbmltcG9ydCB7IFRhYlZpZXdJdGVtIH0gZnJvbSBcInVpL3RhYi12aWV3XCI7XG5pbXBvcnQgeyBzZXRUaW1lb3V0ICwgY2xlYXJUaW1lb3V0IH0gZnJvbSAndGltZXInO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBDb25uZWN0aW9uIH0gZnJvbSBcIi4vc2VydmljZXMvY29ubmVjdGlvblwiO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwiYXBwbGljYXRpb25cIjtcbmltcG9ydCAqIGFzIHBsYXRmb3JtIGZyb20gXCJwbGF0Zm9ybVwiO1xuXG5pbXBvcnQgZGlhbG9ncyA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xuaW1wb3J0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZVwiKTtcblxuZGVjbGFyZSB2YXIgTlNJbmRleFBhdGgsVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbix1bmVzY2FwZSxhbmRyb2lkO1xuXG5jbGFzcyBNZXNzYWdle1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6c3RyaW5nLCBwdWJsaWMgYXZhdGFyOnN0cmluZywgcHVibGljIHBvd2VyOnN0cmluZyxwdWJsaWMgZHIzOnN0cmluZyxwdWJsaWMgZnJvbTpzdHJpbmcscHVibGljIG1lc3NhZ2U6c3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgYmFja2dyb3VuZDpzdHJpbmcscHVibGljIGNvbG9yOnN0cmluZyxwdWJsaWMgbWVzc2FnZUNvbG9yOnN0cmluZyl7fVxufVxuXG5jbGFzcyBOb3RpZmljYXRpb257XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbWFnZTpzdHJpbmcscHVibGljIG1lc3NhZ2U6c3RyaW5nKXt9XG59XG5cbmZ1bmN0aW9uIF91bmVzY2FwZShjb2RlOnN0cmluZyk6IHN0cmluZ3tcbiAgcmV0dXJuIF8udW5lc2NhcGUoY29kZSkucmVwbGFjZSgvJiN4M0M7LywnPCcpO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibXktYXBwXCIsXG4gIHRlbXBsYXRlVXJsOiAnbWFpbi5jb21wb25lbnQuaHRtbCdcbn0pXG5leHBvcnQgY2xhc3MgTWFpbkNvbXBvbmVudHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhZ2U6UGFnZSwgcHJpdmF0ZSBjb25uZWN0OkNvbm5lY3Rpb24sIHB1YmxpYyByb3V0ZXI6Um91dGVyLHByaXZhdGUgcm91dGVyRXh0ZW5zaW9uczogUm91dGVyRXh0ZW5zaW9ucyl7XG4gICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuXG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5vbignbXNnJywgKGRhdGEpID0+IHtcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dCh0cnVlKTtcblxuICAgICAgaWYodHlwZW9mIGRhdGEuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJiBkYXRhLmNtZCAhPSAndS0nKXtcbiAgICAgICAgICBkYXRhLmRhdGEgPSBKU09OLnBhcnNlKHVuZXNjYXBlKGRhdGEuZGF0YSkpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcImxvZ2luXCIpeyAvLyBvbiBsb2dpbiB0byBzZXJ2ZXJcbiAgICAgICAgc3dpdGNoKGRhdGEuZGF0YS5tc2cpe1xuICAgICAgICAgIGNhc2UgXCJva1wiOlxuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJpZCA9IGRhdGEuZGF0YS5pZDtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogXCLYqtiz2KzZitmEINin2YTYr9iu2YjZhFwiLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAn2KrZhSDYqtiz2KzZitmEINin2YTYr9iu2YjZhCDYqNi02YPZhCDYtdit2YrYrScsXG4gICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogXCLYrdiz2YbYp1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnbWFpbiddKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiYmFkbmFtZVwiOlxuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJpZCA9IGRhdGEuZGF0YS5pZDtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogXCLYqtiz2KzZitmEINin2YTYr9iu2YjZhFwiLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAn2YrYsdis2Ykg2KXYrtiq2YrYp9ixINij2LPZhSDYotiu2LEnLFxuICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwi2K3Ys9mG2KdcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5kaXNjb25uZWN0KClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwidXNlZG5hbWVcIjpcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC51c2VyaWQgPSBkYXRhLmRhdGEuaWQ7XG4gICAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwi2KfZhNiq2LPYrNmK2YRcIixcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ9mH2LDYpyDYp9mE2KXYs9mFINmF2LPYrNmEINmF2YYg2YLYqNmEJyxcbiAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcItit2LPZhtinXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImJhZHBhc3NcIjpcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC51c2VyaWQgPSBkYXRhLmRhdGEuaWQ7XG4gICAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwi2KfZhNiq2LPYrNmK2YRcIixcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ9mD2YTZhdmHINin2YTZhdix2YjYsSDYutmK2LEg2YXZhtin2LPYqNmHJyxcbiAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcItit2LPZhtinXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcIndyb25nXCI6XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QudXNlcmlkID0gZGF0YS5kYXRhLmlkO1xuICAgICAgICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcItiq2LPYrNmK2YQg2KfZhNiv2K7ZiNmEXCIsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICfZg9mE2YXZhyDYp9mE2YXYsdmI2LEg2LrZitixINi12K3Zitit2YcnLFxuICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwi2K3Ys9mG2KdcIiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmRpc2Nvbm5lY3QoKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJyZWdcIjpcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdC51c2VyaWQgPSBkYXRhLmRhdGEuaWQ7XG4gICAgICAgICAgICBkaWFsb2dzLmFsZXJ0KHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwi2KfZhNiq2LPYrNmK2YRcIixcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ9iq2YUg2KrYs9is2YrZhCDYp9mE2LnYttmI2YrZhyDYqNmG2KzYp9itICEnLFxuICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwi2K3Ys9mG2KdcIiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcIm1zZ1wiKXsgLy8gcm9vbSBtZXNzYWdlIFxuICAgICAgICB2YXIgbWVzc2FnZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RNZXNzYWdlc1wiKTtcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLmNvbm5lY3QucG93ZXJzLmZpbHRlcih2YWx1ZSA9PiB7XG4gICAgICAgICAgaWYodXNlcikgeyBcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IHVzZXIucG93ZXI7XG4gICAgICAgICAgfSBlbHNlIHsgcmV0dXJuIGZhbHNlfVxuICAgICAgICB9KVswXTtcbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5jb25uZWN0LnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRhdGEuZGF0YS5pY28gPSAodXNlciB8fCB7aWNvOicnfSkuaWNvIHx8ICcnO1xuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEubWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuY29ubmVjdC5tZXNzYWdlcy5sZW5ndGggPiAxMDApe1xuICAgICAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcy5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzLnB1c2goIG5ldyBNZXNzYWdlKCh1c2VyIHx8IHtpZDogXCJcIn0pLmlkICx0aGlzLmNvbm5lY3Quc2VydmVyICsgZGF0YS5kYXRhLnBpYywgc2ljbywgZGF0YS5kYXRhLmljbyAhPSAnJyA/IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcImRybzMvXCIgKyBkYXRhLmRhdGEuaWNvIDogJycsIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIG1lc3NhZ2VzLnJlZnJlc2goKTsgIFxuICAgICAgICAgIGlmIChtZXNzYWdlcy5pb3MpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZXMuaW9zLnNjcm9sbFRvUm93QXRJbmRleFBhdGhBdFNjcm9sbFBvc2l0aW9uQW5pbWF0ZWQoXG4gICAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKHRoaXMuY29ubmVjdC5tZXNzYWdlcy5sZW5ndGgtMSwgMCksXG4gICAgICAgICAgICAgICAgICBVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLlVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb25Ub3AsXG4gICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBtZXNzYWdlcy5zY3JvbGxUb0luZGV4KHRoaXMuY29ubmVjdC5tZXNzYWdlcy5sZW5ndGgtMSk7IFxuICAgICAgICAgIH1cbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuY21kID09IFwibm90XCIpeyAvLyBub3RpZmljYXRpb25zXG4gICAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51c2VyKVswXSB8fCB7IHBpYzogXCJcIiB9O1xuICAgICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArIHVzZXIucGljLF91bmVzY2FwZShkYXRhLmRhdGEubXNnLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKSkpKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIG5vdGlmaWNhdGlvbnMucmVmcmVzaCgpO1xuICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVsaXN0XCIpeyAvLyB1c2VycyBvbmxpbmVcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSBlbGVtZW50LnBvd2VyO1xuICAgICAgICAgIH0pWzBdO1xuXG4gICAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgICAgc2ljbyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY287XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWxlbWVudC5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50LmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZWxlbWVudC51Y29sID09IFwiI1wiKXtcbiAgICAgICAgICAgIGVsZW1lbnQudWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGVsZW1lbnQubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgICBlbGVtZW50Lm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgZWxlbWVudC5pY28gPSAoZWxlbWVudCB8fCB7aWNvOicnfSkuaWNvIHx8ICcnO1xuXG4gICAgICAgICAgZWxlbWVudC5iZyAgICA9IGVsZW1lbnQuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICAgIGVsZW1lbnQuYmcgICAgPSBlbGVtZW50LmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgICAgZWxlbWVudC51Y29sICA9IGVsZW1lbnQudWNvbCAgfHwgJyMwMDAwMDAnO1xuICAgICAgICAgIGVsZW1lbnQudWNvbCAgPSBlbGVtZW50LnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgICBlbGVtZW50Lm1jb2wgID0gZWxlbWVudC5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgICAgZWxlbWVudC5tY29sICA9IGVsZW1lbnQubWNvbC5yZXBsYWNlKC9cXC98XFxcXC8sJycpO1xuXG4gICAgICAgICAgZWxlbWVudC5zaWNvICA9IHNpY287XG5cbiAgICAgICAgICBkYXRhLmRhdGEuZGljbyA9IGRhdGEuZGF0YS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnO1xuXG4gICAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJzLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB0aGlzLnVwZGF0ZVVzZXJzKG9ubGluZXMpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInUtXCIpeyAvLyB1c2VyIGxlZnRcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3QudXNlcnMuc3BsaWNlKHRoaXMuY29ubmVjdC51c2Vycy5pbmRleE9mKHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YSlbMF0pLCAxKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1K1wiKXsgLy8gdXNlciBqb2luXG4gICAgICAgIHZhciBvbmxpbmVzOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0T25saW5lXCIpO1xuICAgICAgICB2YXIgcm9vbXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RSb29tc1wiKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBzaWNvID0gJyc7XG4gICAgICAgIHZhciBwb3dlciA9IHRoaXMuY29ubmVjdC5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IGRhdGEuZGF0YS5wb3dlcjtcbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgaWYocG93ZXIpe1xuICAgICAgICAgIGlmKHBvd2VyLmljbyAhPSAnJyl7XG4gICAgICAgICAgICBzaWNvID0gdGhpcy5jb25uZWN0LnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuaWNvID0gKGRhdGEuZGF0YSB8fCB7aWNvOicnfSkuaWNvIHx8ICcnOyAgICAgICAgICAgICAgICBcblxuICAgICAgICBpZihkYXRhLmRhdGEuYmcgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS5iZyA9IFwiI0ZGRkZGRlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZGF0YS5kYXRhLnVjb2wgPT0gXCIjXCIpe1xuICAgICAgICAgIGRhdGEuZGF0YS51Y29sID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLm1jb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnICAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS51Y29sICA9IGRhdGEuZGF0YS51Y29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sICB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sLnJlcGxhY2UoL1xcL3xcXFxcLywnJyk7XG5cbiAgICAgICAgZGF0YS5kYXRhLmRpY28gPSBkYXRhLmRhdGEuaWNvICE9ICcnID8gdGhpcy5jb25uZWN0LnNlcnZlciArIFwiZHJvMy9cIiArIGRhdGEuZGF0YS5pY28gOiAnJztcblxuICAgICAgICBkYXRhLmRhdGEuc2ljbyAgPSBzaWNvO1xuICAgICAgICB0aGlzLmNvbm5lY3QudXNlcnMucHVzaChkYXRhLmRhdGEpO1xuICAgICAgICB0cnl7XG4gICAgICAgICAgb25saW5lcy5yZWZyZXNoKCk7XG4gICAgICAgICAgcm9vbXMucmVmcmVzaCgpO1xuICAgICAgICAgIHRoaXMudXBkYXRlUm9vbXMocm9vbXMpO1xuICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInVeXCIpeyAvLyB1c2VyIGVkaXRcbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3QudXNlcnMuc3BsaWNlKHRoaXMuY29ubmVjdC51c2Vycy5pbmRleE9mKHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gZGF0YS5kYXRhLnBvd2VyO1xuICAgICAgICB9KVswXTtcblxuICAgICAgICBpZihwb3dlcil7XG4gICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgIHNpY28gPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGF0YS5pY28gPSAoZGF0YS5kYXRhIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLnVjb2wgPSBcIiMwMDAwMDBcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5tY29sID09IFwiI1wiKXtcbiAgICAgICAgICBkYXRhLmRhdGEubWNvbCA9IFwiIzAwMDAwMFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcblxuICAgICAgICBkYXRhLmRhdGEuZGljbyA9IGRhdGEuZGF0YS5pY28gIT0gJycgPyB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJkcm8zL1wiICsgZGF0YS5kYXRhLmljbyA6ICcnO1xuXG4gICAgICAgIGRhdGEuZGF0YS5zaWNvICA9IHNpY287XG5cbiAgICAgICAgdGhpcy5jb25uZWN0LnVzZXJzLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIG9ubGluZXMucmVmcmVzaCgpO1xuICAgICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1clwiKXsgLy8gdXNlciBqb2luIHJvb21cbiAgICAgICAgaWYodGhpcy5jb25uZWN0LnJvb21zID09IFtdIHx8IHRoaXMuY29ubmVjdC51c2VycyA9PSBbXSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9ubGluZXM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB2YXIgdXNlciA9IHRoaXMuY29ubmVjdC51c2Vyc1t0aGlzLmNvbm5lY3QudXNlcnMuaW5kZXhPZih0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHYgPT4gdi5pZCA9PSBkYXRhLmRhdGFbMF0pWzBdKV07XG4gICAgICAgIGlmICh1c2VyID09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgIHJvb21pZDogJydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXNlci5yb29taWQgPSBkYXRhLmRhdGFbMV07XG4gICAgICAgIHRyeXtcbiAgICAgICAgICBvbmxpbmVzLnJlZnJlc2goKTtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwicG93ZXJzXCIpeyAvLyBwb3dlcnNcbiAgICAgICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IGRhdGEuZGF0YTtcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8IHRoaXMuY29ubmVjdC5wb3dlcnMubGVuZ3RoO2krKylcbiAgICAgICAge1xuICAgICAgICAgIHZhciBwbmFtZT0gdGhpcy5jb25uZWN0LnBvd2Vyc1tpXS5uYW1lO1xuICAgICAgICAgIGlmKHBuYW1lPT0nJyl7XG4gICAgICAgICAgICAgIHBuYW1lPSdfJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNvbm5lY3QucG93ZXJzW3BuYW1lXSA9IHRoaXMuY29ubmVjdC5wb3dlcnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gJ2JjJyl7IC8vIGJyb2FkY2FzdFxuICAgICAgICB2YXIgYnJvYWRjYXN0czpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdEJyb2FkY2FzdFwiKTtcbiAgICAgICAgdmFyIHNpY28gPSAnJztcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLmNvbm5lY3QucG93ZXJzLmZpbHRlcih2YWx1ZSA9PiB7XG4gICAgICAgICAgaWYodXNlcikgeyBcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IHVzZXIucG93ZXI7XG4gICAgICAgICAgfSBlbHNlIHsgcmV0dXJuIGZhbHNlfVxuICAgICAgICB9KVswXTtcblxuICAgICAgICBpZihwb3dlcil7XG4gICAgICAgICAgaWYocG93ZXIuaWNvICE9ICcnKXtcbiAgICAgICAgICAgIHNpY28gPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuZGF0YS5pY28gPSAodXNlciB8fCB7aWNvOicnfSkuaWNvIHx8ICcnO1xuXG4gICAgICAgIGlmKGRhdGEuZGF0YS5iZyA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEudWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZihkYXRhLmRhdGEubWNvbCA9PSBcIiNcIil7XG4gICAgICAgICAgZGF0YS5kYXRhLmJnID0gXCIjRkZGRkZGXCI7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcgICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEuYmcgICAgPSBkYXRhLmRhdGEuYmcucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wgIHx8ICcjMDAwMDAwJztcbiAgICAgICAgZGF0YS5kYXRhLm1jb2wgID0gZGF0YS5kYXRhLm1jb2wucmVwbGFjZSgvXFwvfFxcXFwvLCcnKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmKHRoaXMuY29ubmVjdC5icm9hZGNhc3RzLmxlbmd0aCA+IDEwMCl7XG4gICAgICAgICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMucG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cy51bnNoaWZ0KCBuZXcgTWVzc2FnZSgodXNlciB8fCB7aWQ6IFwiXCJ9KS5pZCAsIHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBkYXRhLmRhdGEucGljLCBzaWNvLCBkYXRhLmRhdGEuaWNvICE9ICcnID8gdGhpcy5jb25uZWN0LnNlcnZlciArIFwiZHJvMy9cIiArIGRhdGEuZGF0YS5pY28gOiAnJywgX3VuZXNjYXBlKGRhdGEuZGF0YS50b3BpYyksIF91bmVzY2FwZShkYXRhLmRhdGEubXNnLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGRhdGEuZGF0YS5iZywgZGF0YS5kYXRhLnVjb2wsIGRhdGEuZGF0YS5tY29sKSApO1xuXG4gICAgICAgIHRyeXtcbiAgICAgICAgICBicm9hZGNhc3RzLnJlZnJlc2goKTtcbiAgICAgICAgICBpZiAoYnJvYWRjYXN0cy5pb3MpIHtcbiAgICAgICAgICAgICAgYnJvYWRjYXN0cy5pb3Muc2Nyb2xsVG9Sb3dBdEluZGV4UGF0aEF0U2Nyb2xsUG9zaXRpb25BbmltYXRlZChcbiAgICAgICAgICAgICAgICAgIE5TSW5kZXhQYXRoLmluZGV4UGF0aEZvckl0ZW1JblNlY3Rpb24oMCwgMCksXG4gICAgICAgICAgICAgICAgICBVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLlVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb25Ub3AsXG4gICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBicm9hZGNhc3RzLnNjcm9sbFRvSW5kZXgoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInJsaXN0XCIpeyAvLyByb29tcyBsaXN0XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICBkYXRhLmRhdGEuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICBlbGVtZW50Lm9ubGluZSA9IDA7XG4gICAgICAgICAgdGhpcy5jb25uZWN0LnJvb21zLnB1c2goZWxlbWVudCk7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJyK1wiKXsgLy8gYWRkIHJvb21cbiAgICAgICAgdmFyIHJvb21zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7XG4gICAgICAgIHRoaXMuY29ubmVjdC5yb29tcy5wdXNoKGRhdGEuZGF0YSk7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICByb29tcy5yZWZyZXNoKCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSb29tcyhyb29tcyk7XG4gICAgICAgIH1jYXRjaChlKXt9XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwici1cIil7IC8vIHJlbW92ZSByb29tXG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMuc3BsaWNlKHRoaXMuY29ubmVjdC5yb29tcy5pbmRleE9mKHRoaXMuY29ubmVjdC5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJyXlwiKXsgLy8gcm9vbSBlZGl0XG4gICAgICAgIHZhciByb29tczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdFJvb21zXCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMuc3BsaWNlKHRoaXMuY29ubmVjdC5yb29tcy5pbmRleE9mKHRoaXMuY29ubmVjdC5yb29tcy5maWx0ZXIodiA9PiB2LmlkID09IGRhdGEuZGF0YS5pZClbMF0pLCAxKTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnJvb21zLnB1c2goZGF0YS5kYXRhKTtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgIHJvb21zLnJlZnJlc2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJvb21zKHJvb21zKTtcbiAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCAoZGF0YSkgPT4ge1xuICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICAgIFxuICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5wb3dlcnMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTsgXG4gICAgICB2YXIgbm90aWZpY2F0aW9uczpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArICdwaWMucG5nJywn2KfZiNmHINmE2KcgISEg2KfZhtmC2LfYuSDYp9mE2KfYqti12KfZhCcpKTtcblxuICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgIHRpdGxlOiBcItiu2LfYo1wiLFxuICAgICAgICBtZXNzYWdlOiAn2KfZiNmHINmE2KcgISEg2KfZhtmC2LfYuSDYp9mE2KfYqti12KfZhCcsXG4gICAgICAgIG9rQnV0dG9uVGV4dDogJ9it2LPZhtinJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5kaXNjb25uZWN0KClcblxuICAgICAgdHJ5e1xuICAgICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICAgIH1jYXRjaChlKXt9XG4gICAgfSk7XG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChkYXRhKSA9PiB7ICAgICAgXG4gICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuXG4gICAgICB0aGlzLmNvbm5lY3QubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdOyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLmNvbm5lY3Quc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYrti32KMg2YHZiiDYp9mE2KfYqti12KfZhCcpKTtcblxuICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgIHRpdGxlOiBcItiu2LfYo1wiLFxuICAgICAgICBtZXNzYWdlOiAn2KfZiNmHINmE2KcgISEg2K7Yt9ijINmB2Yog2KfZhNin2KrYtdin2YQnLFxuICAgICAgICBva0J1dHRvblRleHQ6ICfYrdiz2YbYpydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG5cbiAgICAgIHRyeXtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7ICBcbiAgICAgIH1jYXRjaChlKXt9XG4gICAgfSk7XG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5vbignY29ubmVjdF90aW1lb3V0JywgKGRhdGEpID0+IHsgICAgICAgXG4gICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuXG4gICAgICB0aGlzLmNvbm5lY3QubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdOyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLmNvbm5lY3Quc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDZhNinINmK2YXZg9mG2YbZiiDYp9mE2KfYqti12KfZhCDYqNin2YTYrtin2K/ZhScpKTtcblxuICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgIHRpdGxlOiBcItiu2LfYo1wiLFxuICAgICAgICBtZXNzYWdlOiAn2KfZiNmHINmE2KcgISEg2YTYpyDZitmF2YPZhtmG2Yog2KfZhNin2KrYtdin2YQg2KjYp9mE2K7Yp9iv2YUnLFxuICAgICAgICBva0J1dHRvblRleHQ6ICfYrdiz2YbYpydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpICAgICAgXG5cbiAgICAgIHRyeXtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH0pO1xuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ3JlY29ubmVjdF9hdHRlbXB0JywgKGRhdGEpID0+IHsgICAgICBcbiAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG5cbiAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnJvb21zID0gW107IFxuICAgICAgdmFyIG5vdGlmaWNhdGlvbnM6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9in2YbYpyDYp9mC2YjZhSDYqNin2LnYp9iv2Kkg2KfZhNin2KrYtdin2YQg2KjYp9mE2K7Yp9iv2YUg2KfZhNin2YYnKSk7XG5cbiAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICB0aXRsZTogXCLYrti32KNcIixcbiAgICAgICAgbWVzc2FnZTogJ9in2YbYpyDYp9mC2YjZhSDYqNin2LnYp9iv2Kkg2KfZhNin2KrYtdin2YQg2KjYp9mE2K7Yp9iv2YUg2KfZhNin2YYnLFxuICAgICAgICBva0J1dHRvblRleHQ6ICfYrdiz2YbYpydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZGlzY29ubmVjdCgpXG5cbiAgICAgIHRyeXtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5yZWZyZXNoKCk7XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH0pO1xuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Vycm9yJywgKGRhdGEpID0+IHsgXG4gICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuXG4gICAgICB0aGlzLmNvbm5lY3QubWVzc2FnZXMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IFtdO1xuICAgICAgdGhpcy5jb25uZWN0LmJyb2FkY2FzdHMgPSBbXTtcbiAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdOyBcbiAgICAgIHZhciBub3RpZmljYXRpb25zOkxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLmNvbm5lY3Quc2VydmVyICsgJ3BpYy5wbmcnLCfYp9mI2Ycg2YTYpyAhISDYrdiv2Ksg2K7Yt9ijINmF2KcnKSk7XG5cbiAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICB0aXRsZTogXCLYrti32KNcIixcbiAgICAgICAgbWVzc2FnZTogJ9in2YjZhyDZhNinICEhINit2K/YqyDYrti32KMg2YXYpycsXG4gICAgICAgIG9rQnV0dG9uVGV4dDogJ9it2LPZhtinJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5kaXNjb25uZWN0KClcblxuICAgICAgdHJ5e1xuICAgICAgICBub3RpZmljYXRpb25zLnJlZnJlc2goKTtcbiAgICAgIH1jYXRjaChlKXt9XG4gICAgfSk7XG5cbiAgfVxuXG4gIHNlbmRBZHZlcnRpc2luZygpe1xuICAgIGRpYWxvZ3MucHJvbXB0KHtcbiAgICAgIHRpdGxlOiBcItin2LHYs9in2YQg2KfZhNin2LnZhNin2YZcIixcbiAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICBtZXNzYWdlOiBcItin2K/YrtmEINmG2LUg2KfZhNin2LnZhNin2YZcIixcbiAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IFwi2KfZhNi62KfYoVwiLFxuICAgICAgb2tCdXR0b25UZXh0OiBcItin2LHYs9in2YRcIlxuICAgIH0pLnRoZW4ociA9PiB7XG4gICAgICAgIGlmKHIucmVzdWx0KXsgLy8gb24gcHJlc3Mgb2tcbiAgICAgICAgICAvLyBzZW5kIEFkdmVydGlzaW5nXG4gICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KFwibXNnXCIsIHtjbWQ6IFwicG1zZ1wiLCBkYXRhOiB7IG1zZzogci50ZXh0IH19KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb25JdGVtVGFwKGV2dCl7XG4gICAgXG4gIH1cblxuICBqb2luUm9vbShldmVudCxyb29taWQpeyAvLyBqb2luIHJvb21cbiAgICAvLyBqb2luIHJvb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb20gaWRcbiAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmVtaXQoXCJtc2dcIix7Y21kOlwicmpvaW5cIiwgZGF0YToge2lkOiB0aGlzLmNvbm5lY3Qucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSByb29taWQpWzBdLmlkIH0gfSk7XG4gIH07XG5cbiAgc2VuZE1lc3NhZ2UoKXsgLy8gc2VuZCBtZXNzYWdlIHRvIHVzZXIgcm9vbVxuICAgIC8vIGdldCBtZXNzYWdlIGlucHV0XG4gICAgdmFyIHRleHRmaWVsZDpUZXh0RmllbGQ9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcIm1lc3NhZ2VpbnB1dFwiKTtcbiAgICAvLyB3aGVuIHRleHRmaWVsZCBpcyBibGFuayBkb250IHNlbmQgYW55dGhpbmdcbiAgICBpZih0ZXh0ZmllbGQudGV4dC50cmltKCkgPT0gXCJcIikgcmV0dXJuO1xuICAgIC8vIHNlbmQgbWVzc2FnZVxuICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJtc2dcIiwgZGF0YToge21zZzogdGV4dGZpZWxkLnRleHR9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzZW5kQnJvYWRjYXN0KCl7IC8vIHNlbmQgYnJvYWRzY2FzdFxuICAgIC8vZ2V0IGJyb2FkY2FzdCBpbnB1dFxuICAgIHZhciB0ZXh0ZmllbGQ6VGV4dEZpZWxkPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJicm9hZGNhc3RpbnB1dFwiKTtcbiAgICAvLyB3aGVuIHRleHRmaWVsZCBpcyBibGFuayBkb250IHNlbmQgYW55dGhpbmdcbiAgICBpZih0ZXh0ZmllbGQudGV4dC50cmltKCkgPT0gXCJcIikgcmV0dXJuO1xuICAgIC8vIHNlbmQgYnJvYWRjYXN0XG4gICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcImJjXCIsIGRhdGE6IHsgbXNnOiB0ZXh0ZmllbGQudGV4dCwgbGluazogbnVsbCB9IH0pO1xuICAgIC8vIHNldCB0ZXh0ZmllbGQgYmxhbmtcbiAgICB0ZXh0ZmllbGQudGV4dCA9IFwiXCI7XG4gIH1cblxuICBzaG93SW5mbyhpZD86c3RyaW5nKXsgLy8gc2hvdyB1c2VyIGluZm9ybWF0aW9uXG4gICAgaWYodHlwZW9mIGlkICE9IFwic3RyaW5nXCIpe1xuICAgICAgICBkaWFsb2dzLmFjdGlvbih7XG4gICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiBcItin2YTYutin2KFcIixcbiAgICAgICAgICB0aXRsZTogdGhpcy5jb25uZWN0LnVzZXIudG9waWMsXG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgJ9mF2LnZhNmI2YXYp9iq2YonLFxuICAgICAgICAgICAgJ9iq2LPYrNmK2YQg2KfZhNiu2LHZiNisJ1xuICAgICAgICAgIF1cbiAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgIGlmKHJlc3VsdCA9PSAn2YXYudmE2YjZhdin2KrZiicpe1xuICAgICAgICAgICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkodGhpcy5jb25uZWN0LnVzZXIsbnVsbCw0KSk7XG4gICAgICAgICAgfWVsc2UgaWYocmVzdWx0ID09ICfYqtiz2KzZitmEINin2YTYrtix2YjYrCcpe1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiAnbG9nb3V0JywgZGF0YToge319KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICAgIHZhciB1c2VyID0gdGhpcy5jb25uZWN0LnVzZXJzLmZpbHRlcih2PT4gdi5pZCA9PSBpZClbMF07XG4gICAgICAgIHZhciByb29tO1xuICAgICAgICBpZih1c2VyKXtcbiAgICAgICAgICByb29tID0gdGhpcy5jb25uZWN0LnJvb21zLmZpbHRlcih2PT4gdi5pZCA9PSB1c2VyLnJvb21pZClbMF07XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJvb20gPSB0aGlzLmNvbm5lY3Qucm9vbXNbMF07ICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgaWYodXNlciA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICAgICAgdGl0bGU6IFwi2KrZhtio2YrZh1wiLFxuICAgICAgICAgICAgbWVzc2FnZTogXCLYp9mE2LnYttmIINi62YrYsSDZhdmI2KzZiNivINin2YTYp9mGXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFsZXJ0KEpTT04uc3RyaW5naWZ5KHVzZXIsbnVsbCw0KSArIFxuICAgICAgICBcIlxcblwiICsgXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHJvb20sbnVsbCw0KSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlUm9vbXMgKHJvb21zPzpMaXN0Vmlldyl7IC8vIHJlZnJlc2ggcm9vbSBvbmxpbmUgdXNlcnNcbiAgICBpZihyb29tcyA9PSBudWxsKXtcbiAgICAgIHJvb21zID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Um9vbXNcIik7ICAgICAgXG4gICAgfVxuXG4gICAgdGhpcy5jb25uZWN0LnJvb21zLnNvcnQoKGEsIGIpID0+IGIub25saW5lIC0gYS5vbmxpbmUgKTtcblxuICAgIHRoaXMuY29ubmVjdC5yb29tcy5mb3JFYWNoKChlbGVtZW50LGluZGV4KT0+e1xuICAgICAgdmFyIHVzZXJzUm9vbSA9IHRoaXMuY29ubmVjdC51c2Vycy5maWx0ZXIodiA9PiB2LnJvb21pZCA9PSBlbGVtZW50LmlkKTtcbiAgICAgIHRoaXMuY29ubmVjdC5yb29tc1tpbmRleF0ub25saW5lID0gdXNlcnNSb29tLmxlbmd0aDtcbiAgICB9KTtcblxuICAgIHRyeXtcbiAgICAgIHJvb21zLnJlZnJlc2goKVxuICAgIH1jYXRjaChlKXt9XG4gIH1cblxuICB1cGRhdGVVc2VycyAodXNlcnM/Okxpc3RWaWV3KXsgLy8gcmVmcmVzaCByb29tIG9ubGluZSB1c2Vyc1xuICAgIGlmKHVzZXJzID09IG51bGwpe1xuICAgICAgdXNlcnMgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RPbmxpbmVcIik7ICAgICAgXG4gICAgfVxuXG4gICAgdGhpcy5jb25uZWN0LnVzZXIgPSB0aGlzLmNvbm5lY3QudXNlcnMuZmlsdGVyKCh2YWx1ZSxpbmRleCkgPT4gdmFsdWUuaWQgPT0gdGhpcy5jb25uZWN0LnVzZXJpZClbMF07XG4gICAgaWYodGhpcy5jb25uZWN0LnVzZXIpe1xuICAgICAgdGhpcy5jb25uZWN0LnJvb20gPSB0aGlzLmNvbm5lY3Qucm9vbXMuZmlsdGVyKHYgPT4gdi5pZCA9PSB0aGlzLmNvbm5lY3QudXNlci5yb29taWQpWzBdO1xuICAgIH1cbiAgICBpZih0aGlzLmNvbm5lY3QudXNlcil7XG4gICAgICB2YXIgdXNlcmF2YXRhcjpJbWFnZSA9IDxJbWFnZT4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidXNlckF2YXRhclwiKTtcbiAgICAgIHZhciB1c2VydG9waWM6QnV0dG9uID0gPEJ1dHRvbj4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidXNlclRvcGljXCIpO1xuXG4gICAgICB1c2VyYXZhdGFyLnNyYyA9IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyB0aGlzLmNvbm5lY3QudXNlci5waWM7XG4gICAgICB1c2VydG9waWMudGV4dCA9IHRoaXMuY29ubmVjdC51c2VyLnRvcGljO1xuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdC51c2Vycy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZihiLnJlcCA9PSB1bmRlZmluZWQgfHwgYi5yZXAgPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGIucmVwIC0gYS5yZXA7XG4gICAgfSApO1xuXG4gICAgdGhpcy5jb25uZWN0LnVzZXJzLmZvckVhY2goKGVsZW1lbnQsaW5kZXgpPT57XG4gICAgICB2YXIgc2ljbyA9ICcnO1xuICAgICAgdmFyIHBvd2VyID0gdGhpcy5jb25uZWN0LnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS5uYW1lID09IHRoaXMuY29ubmVjdC51c2Vyc1tpbmRleF0ucG93ZXI7XG4gICAgICB9KVswXTtcblxuICAgICAgaWYocG93ZXIpe1xuICAgICAgICBpZihwb3dlci5pY28gIT0gJycpe1xuICAgICAgICAgIHNpY28gPSB0aGlzLmNvbm5lY3Quc2VydmVyICsgXCJzaWNvL1wiICsgcG93ZXIuaWNvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdLmljbyA9ICh0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdIHx8IHtpY286Jyd9KS5pY28gfHwgJyc7XG4gICAgICB0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdLmRpY28gPSB0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdLmljbyAhPSAnJyA/IHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyBcImRybzMvXCIgKyB0aGlzLmNvbm5lY3QudXNlcnNbaW5kZXhdLmljbyA6ICcnO1xuICAgICAgdGhpcy5jb25uZWN0LnVzZXJzW2luZGV4XS5zaWNvID0gc2ljbztcblxuICAgIH0pO1xuXG4gICAgdHJ5e1xuICAgICAgdXNlcnMucmVmcmVzaCgpXG4gICAgfWNhdGNoKGUpe31cblxuICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgIHRoaXMudXBkYXRlVXNlcnModXNlcnMpO1xuICAgIH0sMTAwMCk7XG4gIH1cblxuXG4gIHNob3dQcml2YXRlKCl7XG4gICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydwcml2YXRlJ10pO1xuICB9XG59Il19