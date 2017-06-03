"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_socket_io_1 = require("nativescript-socket.io");
var page_1 = require("ui/page");
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
    }
    AppComponent.prototype.connection = function () {
        var _this = this;
        var server = this.page.getViewById("serverip");
        var username = this.page.getViewById("username");
        var password = this.page.getViewById("password");
        this.server = server.text;
        this.socket = nativescript_socket_io_1.connect(this.server, { transports: ['polling', 'websocket'] });
        this.socket.on('connect', function () {
            var listview = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification('', 'تم الاتصال بنجاح'));
            listview.refresh();
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
            if (data.cmd == "msg") {
                var listview = _this.page.getViewById("listMessages");
                var user = _this.users.filter(function (value) { return value.id == data.data.uid; })[0];
                var power = _this.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                data.data.bg = data.data.bg || '#FFFFFF';
                data.data.ucol = data.data.ucol || '#000000';
                data.data.mcol = data.data.mcol || '#000000';
                _this.messages.push(new Message(_this.server + data.data.pic, (power ? _this.server + "sico/" + power.ico : ''), _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
                listview.refresh();
                if (listview.ios) {
                    listview.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(_this.messages.length - 1, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                }
                else {
                    listview.scrollToIndex(_this.messages.length - 1);
                }
            }
            if (data.cmd == "not") {
                var listview = _this.page.getViewById("listNotifications");
                var user = _this.users.filter(function (value) { return value.id == data.data.user; })[0] || { pic: "" };
                _this.notifications.unshift(new Notification(_this.server + user.pic, _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, ""))));
                listview.refresh();
            }
            if (data.cmd == "ulist") {
                var listview = _this.page.getViewById("listonline");
                _this.users = data.data;
                listview.refresh();
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
                var listview = _this.page.getViewById("listBroadcast");
                var user = _this.users.filter(function (value) { return value.id == data.data.uid; })[0];
                var power = _this.powers.filter(function (value) {
                    if (user) {
                        return value.name == user.power;
                    }
                    else {
                        return false;
                    }
                })[0];
                data.data.bg = data.data.bg || '#FFFFFF';
                data.data.ucol = data.data.ucol || '#000000';
                data.data.mcol = data.data.mcol || '#000000';
                _this.broadcasts.unshift(new Message(_this.server + data.data.pic, (power ? _this.server + "sico/" + power.ico : ''), _unescape(data.data.topic), _unescape(data.data.msg.replace(/<\/?[^>]+(>|$)/g, "")), data.data.bg, data.data.ucol, data.data.mcol));
                listview.refresh();
                if (listview.ios) {
                    listview.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(0, 0), UITableViewScrollPosition.UITableViewScrollPositionTop, true);
                }
                else {
                    listview.scrollToIndex(0);
                }
            }
        });
        this.socket.on('disconnect', function (data) {
            var listview = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification('', 'اوه لا !! انقطع الاتصال'));
            listview.refresh();
        });
        this.socket.on('connect_error', function (data) {
            var listview = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification('', 'اوه لا !! خطأ في الاتصال'));
            listview.refresh();
        });
        this.socket.on('connect_timeout', function (data) {
            var listview = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification('', 'اوه لا !! لا يمكنني الاتصال بالخادم'));
            listview.refresh();
        });
        this.socket.on('reconnect_attempt', function (data) {
            var listview = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification('', 'انا اقوم باعادة الاتصال بالخادم الان'));
            listview.refresh();
        });
        this.socket.on('error', function (data) {
            var listview = _this.page.getViewById("listNotifications");
            _this.notifications.unshift(new Notification('', 'اوه لا !! حدث خطأ ما'));
            listview.refresh();
        });
    };
    AppComponent.prototype.onItemTap = function (evt) {
    };
    AppComponent.prototype.sendMessage = function () {
        var textfield = this.page.getViewById("messageinput");
        if (textfield.text.trim() == "")
            return;
        this.socket.emit("msg", { cmd: "msg", data: { msg: textfield.text } });
        textfield.text = "";
    };
    AppComponent.prototype.sendBroadcast = function () {
        var textfield = this.page.getViewById("broadcastinput");
        if (textfield.text.trim() == "")
            return;
        this.socket.emit("msg", { cmd: "bc", data: { msg: textfield.text, link: null } });
        textfield.text = "";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBMEM7QUFDMUMsaUVBQStEO0FBQy9ELGdDQUE4QjtBQUc5Qiw4QkFBaUM7QUFHakM7SUFDRSxpQkFBbUIsTUFBYSxFQUFTLEtBQVksRUFBUSxJQUFXLEVBQVEsT0FBYyxFQUMzRSxVQUFpQixFQUFRLEtBQVksRUFBUSxZQUFtQjtRQURoRSxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFNBQUksR0FBSixJQUFJLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO1FBQzNFLGVBQVUsR0FBVixVQUFVLENBQU87UUFBUSxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsaUJBQVksR0FBWixZQUFZLENBQU87SUFBRSxDQUFDO0lBQ3hGLGNBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUVEO0lBQ0Usc0JBQW1CLEtBQVksRUFBUSxPQUFjO1FBQWxDLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO0lBQUUsQ0FBQztJQUMxRCxtQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQsbUJBQW1CLElBQVc7SUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxHQUFHLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBTUQsSUFBYSxZQUFZO0lBVXZCLHNCQUFtQixJQUFTO1FBQVQsU0FBSSxHQUFKLElBQUksQ0FBSztRQUpyQixXQUFNLEdBQVcseUJBQXlCLENBQUM7UUFHMUMsb0JBQWUsR0FBVyxxQkFBcUIsQ0FBQztRQUV0RCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJ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QUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxvQ0FBYSxHQUFiO1FBQ0UsSUFBSSxTQUFTLEdBQXdCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDN0UsRUFBRSxDQUFBLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLFNBQVMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUEzS0QsSUEyS0M7QUEzS1ksWUFBWTtJQUp4QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLG9CQUFvQjtLQUNsQyxDQUFDO3FDQVd3QixXQUFJO0dBVmpCLFlBQVksQ0EyS3hCO0FBM0tZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGNvbm5lY3QsU29ja2V0T3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtc29ja2V0LmlvXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIlxuaW1wb3J0IHsgTGlzdFZpZXcgfSBmcm9tIFwidWkvbGlzdC12aWV3XCJcbmltcG9ydCB7IFRleHRGaWVsZCB9IGZyb20gXCJ1aS90ZXh0LWZpZWxkXCJcbmltcG9ydCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmVcIik7XG5kZWNsYXJlIHZhciBOU0luZGV4UGF0aCxVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLHVuZXNjYXBlO1xuXG5jbGFzcyBNZXNzYWdle1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXZhdGFyOnN0cmluZywgcHVibGljIHBvd2VyOnN0cmluZyxwdWJsaWMgZnJvbTpzdHJpbmcscHVibGljIG1lc3NhZ2U6c3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgYmFja2dyb3VuZDpzdHJpbmcscHVibGljIGNvbG9yOnN0cmluZyxwdWJsaWMgbWVzc2FnZUNvbG9yOnN0cmluZyl7fVxufVxuXG5jbGFzcyBOb3RpZmljYXRpb257XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbWFnZTpzdHJpbmcscHVibGljIG1lc3NhZ2U6c3RyaW5nKXt9XG59XG5cbmZ1bmN0aW9uIF91bmVzY2FwZShjb2RlOnN0cmluZyk6IHN0cmluZ3tcbiAgcmV0dXJuIF8udW5lc2NhcGUoY29kZSkucmVwbGFjZSgvJiN4M0M7LywnPCcpO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibXktYXBwXCIsXG4gIHRlbXBsYXRlVXJsOiAnYXBwLmNvbXBvbmVudC5odG1sJ1xufSlcbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQge1xuICBwdWJsaWMgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2U+O1xuICBwdWJsaWMgYnJvYWRjYXN0czogQXJyYXk8TWVzc2FnZT47XG4gIHB1YmxpYyBub3RpZmljYXRpb25zOiBBcnJheTxOb3RpZmljYXRpb24+O1xuICBwdWJsaWMgdXNlcnM6IEFycmF5PGFueT47XG4gIHB1YmxpYyBwb3dlcnM6IEFycmF5PGFueT47XG4gIHB1YmxpYyBzZXJ2ZXI6IHN0cmluZyA9IFwiaHR0cDovL2toYWxlZWpjaGF0LmNvbS9cIjtcblxuICBwcml2YXRlIHNvY2tldDtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uX25hbWU6IHN0cmluZyA9IFwiQW5kcm9pZCBBcHBsaWNhdGlvblwiO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFnZTpQYWdlKXtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5ub3RpZmljYXRpb25zID0gW107XG4gICAgdGhpcy51c2VycyA9IFtdO1xuICAgIHRoaXMucG93ZXJzID0gW107XG4gICAgdGhpcy5icm9hZGNhc3RzID0gW107XG4gIH1cblxuICBjb25uZWN0aW9uKCl7XG4gICAgdmFyIHNlcnZlcjpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJpcFwiKTtcbiAgICB2YXIgdXNlcm5hbWU6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwidXNlcm5hbWVcIik7XG4gICAgdmFyIHBhc3N3b3JkOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInBhc3N3b3JkXCIpO1xuICAgIHRoaXMuc2VydmVyID0gc2VydmVyLnRleHQ7XG4gICAgXG4gICAgdGhpcy5zb2NrZXQgPSBjb25uZWN0KHRoaXMuc2VydmVyLCA8U29ja2V0T3B0aW9ucz4geyB0cmFuc3BvcnRzOiBbJ3BvbGxpbmcnLCAnd2Vic29ja2V0J10gfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICB2YXIgbGlzdHZpZXc6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbignJywn2KrZhSDYp9mE2KfYqti12KfZhCDYqNmG2KzYp9itJykpO1xuICAgICAgbGlzdHZpZXcucmVmcmVzaCgpO1xuXG4gICAgICB0aGlzLnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiBcImxvZ2luXCIgLCBkYXRhOntcbiAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLnRleHQsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZC50ZXh0LFxuICAgICAgICBzdGVhbHRoOiB0cnVlLFxuICAgICAgICBmcDogdGhpcy5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICByZWZyOiB0aGlzLmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgIHI6IHRoaXMuY29ubmVjdGlvbl9uYW1lXG4gICAgICB9fSk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ21zZycsIChkYXRhKSA9PiB7XG4gICAgICBpZih0eXBlb2YgZGF0YS5kYXRhID09PSBcInN0cmluZ1wiICYmIGRhdGEuY21kICE9ICd1LScpe1xuICAgICAgICAgIGRhdGEuZGF0YSA9IEpTT04ucGFyc2UodW5lc2NhcGUoZGF0YS5kYXRhKSk7XG4gICAgICB9XG5cbiAgICAgIGlmKGRhdGEuY21kID09IFwibXNnXCIpeyAvLyByb29tIG1lc3NhZ2UgXG4gICAgICAgIHZhciBsaXN0dmlldzpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE1lc3NhZ2VzXCIpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudWlkKVswXTtcbiAgICAgICAgdmFyIHBvd2VyID0gdGhpcy5wb3dlcnMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgICBpZih1c2VyKSB7IFxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm5hbWUgPT0gdXNlci5wb3dlcjtcbiAgICAgICAgICB9IGVsc2UgeyByZXR1cm4gZmFsc2V9XG4gICAgICAgIH0pWzBdO1xuXG4gICAgICAgIGRhdGEuZGF0YS5iZyAgICA9IGRhdGEuZGF0YS5iZyAgIHx8ICcjRkZGRkZGJztcbiAgICAgICAgZGF0YS5kYXRhLnVjb2wgID0gZGF0YS5kYXRhLnVjb2wgfHwgJyMwMDAwMDAnO1xuICAgICAgICBkYXRhLmRhdGEubWNvbCAgPSBkYXRhLmRhdGEubWNvbCB8fCAnIzAwMDAwMCc7XG4gICAgICAgIHRoaXMubWVzc2FnZXMucHVzaCggbmV3IE1lc3NhZ2UodGhpcy5zZXJ2ZXIgKyBkYXRhLmRhdGEucGljLCAocG93ZXIgPyB0aGlzLnNlcnZlciArIFwic2ljby9cIiArIHBvd2VyLmljbyA6ICcnKSwgX3VuZXNjYXBlKGRhdGEuZGF0YS50b3BpYyksIF91bmVzY2FwZShkYXRhLmRhdGEubXNnLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGRhdGEuZGF0YS5iZywgZGF0YS5kYXRhLnVjb2wsIGRhdGEuZGF0YS5tY29sKSApO1xuICAgICAgICBsaXN0dmlldy5yZWZyZXNoKCk7ICBcbiAgICAgICAgXG4gICAgICAgIGlmIChsaXN0dmlldy5pb3MpIHtcbiAgICAgICAgICAgIGxpc3R2aWV3Lmlvcy5zY3JvbGxUb1Jvd0F0SW5kZXhQYXRoQXRTY3JvbGxQb3NpdGlvbkFuaW1hdGVkKFxuICAgICAgICAgICAgICAgIE5TSW5kZXhQYXRoLmluZGV4UGF0aEZvckl0ZW1JblNlY3Rpb24odGhpcy5tZXNzYWdlcy5sZW5ndGgtMSwgMCksXG4gICAgICAgICAgICAgICAgVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbi5VSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uVG9wLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsaXN0dmlldy5zY3JvbGxUb0luZGV4KHRoaXMubWVzc2FnZXMubGVuZ3RoLTEpOyBcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5jbWQgPT0gXCJub3RcIil7IC8vIG5vdGlmaWNhdGlvbnNcbiAgICAgICAgdmFyIGxpc3R2aWV3Okxpc3RWaWV3ID0gPExpc3RWaWV3PiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJsaXN0Tm90aWZpY2F0aW9uc1wiKTtcbiAgICAgICAgdmFyIHVzZXIgPSB0aGlzLnVzZXJzLmZpbHRlcih2YWx1ZSA9PiB2YWx1ZS5pZCA9PSBkYXRhLmRhdGEudXNlcilbMF0gfHwgeyBwaWM6IFwiXCIgfTtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbih0aGlzLnNlcnZlcit1c2VyLnBpYyxfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpKSk7XG4gICAgICAgIGxpc3R2aWV3LnJlZnJlc2goKTtcbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gXCJ1bGlzdFwiKXsgLy8gdXNlcnMgb25saW5lXG4gICAgICAgIHZhciBsaXN0dmlldzpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdG9ubGluZVwiKTtcbiAgICAgICAgdGhpcy51c2VycyA9IGRhdGEuZGF0YTtcbiAgICAgICAgbGlzdHZpZXcucmVmcmVzaCgpO1xuICAgICAgfVxuXG4gICAgICBpZihkYXRhLmNtZCA9PSBcInBvd2Vyc1wiKXsgLy8gcG93ZXJzXG4gICAgICAgIHRoaXMucG93ZXJzID0gZGF0YS5kYXRhO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTwgdGhpcy5wb3dlcnMubGVuZ3RoO2krKylcbiAgICAgICAge1xuICAgICAgICAgIHZhciBwbmFtZT0gdGhpcy5wb3dlcnNbaV0ubmFtZTtcbiAgICAgICAgICBpZihwbmFtZT09Jycpe3BuYW1lPSdfJzt9XG4gICAgICAgICAgdGhpcy5wb3dlcnNbcG5hbWVdID0gdGhpcy5wb3dlcnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoZGF0YS5jbWQgPT0gJ2JjJyl7IC8vIGJyb2FkY2FzdFxuICAgICAgICB2YXIgbGlzdHZpZXc6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3RCcm9hZGNhc3RcIik7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXNlciA9IHRoaXMudXNlcnMuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmlkID09IGRhdGEuZGF0YS51aWQpWzBdO1xuICAgICAgICB2YXIgcG93ZXIgPSB0aGlzLnBvd2Vycy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICAgIGlmKHVzZXIpIHsgXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubmFtZSA9PSB1c2VyLnBvd2VyO1xuICAgICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZX1cbiAgICAgICAgfSlbMF07XG5cbiAgICAgICAgZGF0YS5kYXRhLmJnICAgID0gZGF0YS5kYXRhLmJnICAgfHwgJyNGRkZGRkYnO1xuICAgICAgICBkYXRhLmRhdGEudWNvbCAgPSBkYXRhLmRhdGEudWNvbCB8fCAnIzAwMDAwMCc7XG4gICAgICAgIGRhdGEuZGF0YS5tY29sICA9IGRhdGEuZGF0YS5tY29sIHx8ICcjMDAwMDAwJztcbiAgICAgICAgdGhpcy5icm9hZGNhc3RzLnVuc2hpZnQoIG5ldyBNZXNzYWdlKHRoaXMuc2VydmVyICsgZGF0YS5kYXRhLnBpYywgKHBvd2VyID8gdGhpcy5zZXJ2ZXIgKyBcInNpY28vXCIgKyBwb3dlci5pY28gOiAnJyksIF91bmVzY2FwZShkYXRhLmRhdGEudG9waWMpLCBfdW5lc2NhcGUoZGF0YS5kYXRhLm1zZy5yZXBsYWNlKC88XFwvP1tePl0rKD58JCkvZywgXCJcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBkYXRhLmRhdGEuYmcsIGRhdGEuZGF0YS51Y29sLCBkYXRhLmRhdGEubWNvbCkgKTtcbiAgICAgICAgbGlzdHZpZXcucmVmcmVzaCgpOyAgXG4gICAgICAgIFxuICAgICAgICBpZiAobGlzdHZpZXcuaW9zKSB7XG4gICAgICAgICAgICBsaXN0dmlldy5pb3Muc2Nyb2xsVG9Sb3dBdEluZGV4UGF0aEF0U2Nyb2xsUG9zaXRpb25BbmltYXRlZChcbiAgICAgICAgICAgICAgICBOU0luZGV4UGF0aC5pbmRleFBhdGhGb3JJdGVtSW5TZWN0aW9uKDAsIDApLFxuICAgICAgICAgICAgICAgIFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24uVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvblRvcCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGlzdHZpZXcuc2Nyb2xsVG9JbmRleCgwKTtcbiAgICAgICAgfVxuICAgICAgfSBcbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbGlzdHZpZXc6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbignJywn2KfZiNmHINmE2KcgISEg2KfZhtmC2LfYuSDYp9mE2KfYqti12KfZhCcpKTtcbiAgICAgIGxpc3R2aWV3LnJlZnJlc2goKTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChkYXRhKSA9PiB7XG4gICAgICB2YXIgbGlzdHZpZXc6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbignJywn2KfZiNmHINmE2KcgISEg2K7Yt9ijINmB2Yog2KfZhNin2KrYtdin2YQnKSk7XG4gICAgICBsaXN0dmlldy5yZWZyZXNoKCk7ICBcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF90aW1lb3V0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbGlzdHZpZXc6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbignJywn2KfZiNmHINmE2KcgISEg2YTYpyDZitmF2YPZhtmG2Yog2KfZhNin2KrYtdin2YQg2KjYp9mE2K7Yp9iv2YUnKSk7XG4gICAgICBsaXN0dmlldy5yZWZyZXNoKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zb2NrZXQub24oJ3JlY29ubmVjdF9hdHRlbXB0JywgKGRhdGEpID0+IHsgXG4gICAgICB2YXIgbGlzdHZpZXc6TGlzdFZpZXcgPSA8TGlzdFZpZXc+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcImxpc3ROb3RpZmljYXRpb25zXCIpO1xuICAgICAgdGhpcy5ub3RpZmljYXRpb25zLnVuc2hpZnQobmV3IE5vdGlmaWNhdGlvbignJywn2KfZhtinINin2YLZiNmFINio2KfYudin2K/YqSDYp9mE2KfYqti12KfZhCDYqNin2YTYrtin2K/ZhSDYp9mE2KfZhicpKTtcbiAgICAgIGxpc3R2aWV3LnJlZnJlc2goKTtcbiAgICB9KTtcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZGF0YSkgPT4geyBcbiAgICAgIHZhciBsaXN0dmlldzpMaXN0VmlldyA9IDxMaXN0Vmlldz4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibGlzdE5vdGlmaWNhdGlvbnNcIik7XG4gICAgICB0aGlzLm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKCcnLCfYp9mI2Ycg2YTYpyAhISDYrdiv2Ksg2K7Yt9ijINmF2KcnKSk7XG4gICAgICBsaXN0dmlldy5yZWZyZXNoKCk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIG9uSXRlbVRhcChldnQpe1xuICAgIFxuICB9XG5cbiAgc2VuZE1lc3NhZ2UoKXtcbiAgICB2YXIgdGV4dGZpZWxkOlRleHRGaWVsZD0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwibWVzc2FnZWlucHV0XCIpO1xuICAgIGlmKHRleHRmaWVsZC50ZXh0LnRyaW0oKSA9PSBcIlwiKSByZXR1cm47XG4gICAgdGhpcy5zb2NrZXQuZW1pdChcIm1zZ1wiLHtjbWQ6XCJtc2dcIiwgZGF0YToge21zZzogdGV4dGZpZWxkLnRleHR9IH0pO1xuICAgIHRleHRmaWVsZC50ZXh0ID0gXCJcIjtcbiAgfVxuXG4gIHNlbmRCcm9hZGNhc3QoKXtcbiAgICB2YXIgdGV4dGZpZWxkOlRleHRGaWVsZD0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwiYnJvYWRjYXN0aW5wdXRcIik7XG4gICAgaWYodGV4dGZpZWxkLnRleHQudHJpbSgpID09IFwiXCIpIHJldHVybjtcbiAgICB0aGlzLnNvY2tldC5lbWl0KFwibXNnXCIse2NtZDpcImJjXCIsIGRhdGE6IHsgbXNnOiB0ZXh0ZmllbGQudGV4dCwgbGluazogbnVsbCB9IH0pO1xuICAgIHRleHRmaWVsZC50ZXh0ID0gXCJcIjtcbiAgfVxufSJdfQ==