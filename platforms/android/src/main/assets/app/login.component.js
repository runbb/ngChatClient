"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var nativescript_socket_io_1 = require("nativescript-socket.io");
var page_1 = require("ui/page");
var connection_1 = require("./services/connection");
var dialogs = require("ui/dialogs");
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
var LoginComponent = (function () {
    function LoginComponent(page, connect, router) {
        this.page = page;
        this.connect = connect;
        this.router = router;
        this.servers = [
            "http://3ch8.com/",
            "http://flhchat.com/",
            "http://khaleejchat.com/",
        ];
        this.connect.messages = [];
        this.connect.notifications = [];
        this.connect.users = [];
        this.connect.powers = [];
        this.connect.broadcasts = [];
        this.connect.rooms = [];
        this.connect.connected.next(false);
    }
    LoginComponent.prototype.connection = function (type) {
        var _this = this;
        this.connect.connected.next(false);
        var server = this.page.getViewById("serverip");
        var username = this.page.getViewById("username");
        var password = this.page.getViewById("password");
        var listpicker = this.page.getViewById("serverslist");
        this.connect.server = this.servers[listpicker.selectedIndex];
        if (username.text.trim() == '' || password.text.trim() == '') {
            dialogs.alert({
                title: "خطأ",
                message: 'يجب عدم ترك احد الحقول فارغًا',
                okButtonText: "حسنا"
            });
            return;
        }
        this.connect.socket = nativescript_socket_io_1.connect(this.connect.server, { transports: ['polling', 'websocket'] });
        this.connect.socket.on('connect', function () {
            _this.connect.connected.next(true);
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'تم الاتصال بنجاح'));
            if (type == 'user') {
                _this.connect.socket.emit('msg', { cmd: "login", data: {
                        username: username.text,
                        password: password.text,
                        stealth: true,
                        fp: _this.connect.connection_name,
                        refr: _this.connect.connection_name,
                        r: _this.connect.connection_name,
                        uprofile: {}
                    } });
                _this.router.navigate(['main']);
            }
            else if (type == 'guest') {
                _this.connect.socket.emit('msg', { cmd: "login", data: {
                        username: username.text,
                        fp: _this.connect.connection_name,
                        refr: _this.connect.connection_name,
                        r: _this.connect.connection_name,
                        uprofile: {}
                    } });
                _this.router.navigate(['main']);
            }
        });
        this.connect.socket.on('error', function () {
            _this.router.navigate(['']);
        });
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        selector: "my-app",
        templateUrl: 'login.component.html'
    }),
    __metadata("design:paramtypes", [page_1.Page, connection_1.Connection, router_1.Router])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQTBDO0FBQzFDLDBDQUF5QztBQUN6QyxpRUFBK0Q7QUFDL0QsZ0NBQStCO0FBTS9CLG9EQUFtRDtBQUVuRCxvQ0FBdUM7QUFJdkM7SUFDRSxpQkFBbUIsRUFBUyxFQUFTLE1BQWEsRUFBUyxLQUFZLEVBQVEsR0FBVSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQy9HLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFFBQUcsR0FBSCxHQUFHLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztRQUMvRyxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLGlCQUFZLEdBQVosWUFBWSxDQUFPO0lBQUUsQ0FBQztJQUN4RixjQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUNFLHNCQUFtQixLQUFZLEVBQVEsT0FBYztRQUFsQyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFFLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQU1ELElBQWEsY0FBYztJQU92Qix3QkFBbUIsSUFBUyxFQUFVLE9BQWtCLEVBQVMsTUFBYTtRQUEzRCxTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBVztRQUFTLFdBQU0sR0FBTixNQUFNLENBQU87UUFOOUUsWUFBTyxHQUFhO1lBQ2hCLGtCQUFrQjtZQUNsQixxQkFBcUI7WUFDckIseUJBQXlCO1NBQzVCLENBQUM7UUFHRSxJQUFJLENB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bmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IGNvbm5lY3QsU29ja2V0T3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtc29ja2V0LmlvXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCB7IFRleHRGaWVsZCB9IGZyb20gXCJ1aS90ZXh0LWZpZWxkXCI7XG5pbXBvcnQgeyBMaXN0UGlja2VyIH0gZnJvbSBcInVpL2xpc3QtcGlja2VyXCI7XG5pbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSAndGltZXInO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBDb25uZWN0aW9uIH0gZnJvbSBcIi4vc2VydmljZXMvY29ubmVjdGlvblwiO1xuXG5pbXBvcnQgZGlhbG9ncyA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xuXG5kZWNsYXJlIHZhciBOU0luZGV4UGF0aCxVSVRhYmxlVmlld1Njcm9sbFBvc2l0aW9uLHVuZXNjYXBlLGFuZHJvaWQ7XG5cbmNsYXNzIE1lc3NhZ2V7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpZDpzdHJpbmcsIHB1YmxpYyBhdmF0YXI6c3RyaW5nLCBwdWJsaWMgcG93ZXI6c3RyaW5nLHB1YmxpYyBkcjM6c3RyaW5nLHB1YmxpYyBmcm9tOnN0cmluZyxwdWJsaWMgbWVzc2FnZTpzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBiYWNrZ3JvdW5kOnN0cmluZyxwdWJsaWMgY29sb3I6c3RyaW5nLHB1YmxpYyBtZXNzYWdlQ29sb3I6c3RyaW5nKXt9XG59XG5cbmNsYXNzIE5vdGlmaWNhdGlvbntcbiAgY29uc3RydWN0b3IocHVibGljIGltYWdlOnN0cmluZyxwdWJsaWMgbWVzc2FnZTpzdHJpbmcpe31cbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICB0ZW1wbGF0ZVVybDogJ2xvZ2luLmNvbXBvbmVudC5odG1sJ1xufSlcbmV4cG9ydCBjbGFzcyBMb2dpbkNvbXBvbmVudHtcbiAgICBzZXJ2ZXJzOiBzdHJpbmdbXSA9IFtcbiAgICAgICAgXCJodHRwOi8vM2NoOC5jb20vXCIsXG4gICAgICAgIFwiaHR0cDovL2ZsaGNoYXQuY29tL1wiLFxuICAgICAgICBcImh0dHA6Ly9raGFsZWVqY2hhdC5jb20vXCIsXG4gICAgXTtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBwYWdlOlBhZ2UsIHByaXZhdGUgY29ubmVjdDpDb25uZWN0aW9uLCBwdWJsaWMgcm91dGVyOlJvdXRlcil7XG4gICAgICAgIHRoaXMuY29ubmVjdC5tZXNzYWdlcyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QudXNlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnBvd2VycyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QuYnJvYWRjYXN0cyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3Qucm9vbXMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICB9XG5cbiAgICBjb25uZWN0aW9uKHR5cGU6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuY29ubmVjdC5jb25uZWN0ZWQubmV4dChmYWxzZSk7XG4gICAgICAgIHZhciBzZXJ2ZXI6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwic2VydmVyaXBcIik7XG4gICAgICAgIHZhciB1c2VybmFtZTpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJ1c2VybmFtZVwiKTtcbiAgICAgICAgdmFyIHBhc3N3b3JkOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInBhc3N3b3JkXCIpO1xuXG4gICAgICAgIHZhciBsaXN0cGlja2VyOkxpc3RQaWNrZXIgPSA8TGlzdFBpY2tlcj4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwic2VydmVyc2xpc3RcIik7XG4gICAgICAgIHRoaXMuY29ubmVjdC5zZXJ2ZXIgPSB0aGlzLnNlcnZlcnNbbGlzdHBpY2tlci5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgXG4gICAgICAgIGlmKHVzZXJuYW1lLnRleHQudHJpbSgpID09ICcnIHx8IHBhc3N3b3JkLnRleHQudHJpbSgpID09ICcnKXtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogXCLYrti32KNcIixcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ9mK2KzYqCDYudiv2YUg2KrYsdmDINin2K3YryDYp9mE2K3ZgtmI2YQg2YHYp9ix2LrZi9inJyxcbiAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcItit2LPZhtinXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldCA9IGNvbm5lY3QodGhpcy5jb25uZWN0LnNlcnZlciwgPFNvY2tldE9wdGlvbnM+IHsgdHJhbnNwb3J0czogWydwb2xsaW5nJywgJ3dlYnNvY2tldCddIH0pO1xuICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdjb25uZWN0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9iq2YUg2KfZhNin2KrYtdin2YQg2KjZhtis2KfYrScpKTtcbiAgICAgICAgICAgIGlmKHR5cGUgPT0gJ3VzZXInKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmVtaXQoJ21zZycsIHtjbWQ6IFwibG9naW5cIiAsIGRhdGE6e1xuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHN0ZWFsdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZwOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lLCBcbiAgICAgICAgICAgICAgICAgICAgcmVmcjogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgICAgICAgICAgICAgIHI6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVwcm9maWxlOiB7fVxuICAgICAgICAgICAgICAgIH19KTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ21haW4nXSk7XG4gICAgICAgICAgICB9ZWxzZSBpZih0eXBlID09ICdndWVzdCcpe1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdCgnbXNnJywge2NtZDogXCJsb2dpblwiICwgZGF0YTp7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBmcDogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgICAgICAgICAgICAgIHJlZnI6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICAgICAgICAgICAgICByOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lLFxuICAgICAgICAgICAgICAgICAgICB1cHJvZmlsZToge31cbiAgICAgICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydtYWluJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnJ10pO1xuICAgICAgICB9KTtcbiAgICB9XG59Il19