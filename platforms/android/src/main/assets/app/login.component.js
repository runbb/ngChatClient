"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var nativescript_socket_io_1 = require("nativescript-socket.io");
var page_1 = require("ui/page");
var connection_1 = require("./services/connection");
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
    LoginComponent.prototype.connection = function () {
        var _this = this;
        this.connect.connected.next(false);
        var server = this.page.getViewById("serverip");
        var username = this.page.getViewById("username");
        var password = this.page.getViewById("password");
        var password = this.page.getViewById("password");
        var listpicker = this.page.getViewById("serverslist");
        this.connect.server = this.servers[listpicker.selectedIndex];
        this.connect.socket = nativescript_socket_io_1.connect(this.connect.server, { transports: ['polling', 'websocket'] });
        this.connect.socket.on('connect', function () {
            _this.connect.connected.next(true);
            _this.connect.notifications.unshift(new Notification(_this.connect.server + 'pic.png', 'تم الاتصال بنجاح'));
            _this.connect.socket.emit('msg', { cmd: "login", data: {
                    username: username.text,
                    password: password.text,
                    stealth: true,
                    fp: _this.connect.connection_name,
                    refr: _this.connect.connection_name,
                    r: _this.connect.connection_name
                } });
            _this.router.navigate(['main']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQTBDO0FBQzFDLDBDQUF5QztBQUN6QyxpRUFBK0Q7QUFDL0QsZ0NBQStCO0FBTS9CLG9EQUFtRDtBQUluRDtJQUNFLGlCQUFtQixFQUFTLEVBQVMsTUFBYSxFQUFTLEtBQVksRUFBUSxHQUFVLEVBQVEsSUFBVyxFQUFRLE9BQWMsRUFDL0csVUFBaUIsRUFBUSxLQUFZLEVBQVEsWUFBbUI7UUFEaEUsT0FBRSxHQUFGLEVBQUUsQ0FBTztRQUFTLFdBQU0sR0FBTixNQUFNLENBQU87UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsUUFBRyxHQUFILEdBQUcsQ0FBTztRQUFRLFNBQUksR0FBSixJQUFJLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO1FBQy9HLGVBQVUsR0FBVixVQUFVLENBQU87UUFBUSxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsaUJBQVksR0FBWixZQUFZLENBQU87SUFBRSxDQUFDO0lBQ3hGLGNBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUVEO0lBQ0Usc0JBQW1CLEtBQVksRUFBUSxPQUFjO1FBQWxDLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO0lBQUUsQ0FBQztJQUMxRCxtQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBTUQsSUFBYSxjQUFjO0lBT3ZCLHdCQUFtQixJQUFTLEVBQVUsT0FBa0IsRUFBUyxNQUFhO1FBQTNELFNBQUksR0FBSixJQUFJLENBQUs7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFXO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBTztRQU45RSxZQUFPLEdBQWE7WUFDcEIsa0JBQWtCO1lBQ2xCLHFCQUFxQjtZQUNyQix5QkFBeUI7U0FDeEIsQ0FBQztRQUdFLElBQUksQ0FBQyxPQUFPLENBQUMs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QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLHNCQUFzQjtLQUNwQyxDQUFDO3FDQVEwQixXQUFJLEVBQWtCLHVCQUFVLEVBQWdCLGVBQU07R0FQckUsY0FBYyxDQStDMUI7QUEvQ1ksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcInVpL3RleHQtZmllbGRcIjtcbmltcG9ydCB7IExpc3RQaWNrZXIgfSBmcm9tIFwidWkvbGlzdC1waWNrZXJcIjtcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0aW1lcic7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IENvbm5lY3Rpb24gfSBmcm9tIFwiLi9zZXJ2aWNlcy9jb25uZWN0aW9uXCI7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibXktYXBwXCIsXG4gIHRlbXBsYXRlVXJsOiAnbG9naW4uY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIExvZ2luQ29tcG9uZW50e1xuICAgIHNlcnZlcnM6IHN0cmluZ1tdID0gW1xuICAgIFwiaHR0cDovLzNjaDguY29tL1wiLFxuICAgIFwiaHR0cDovL2ZsaGNoYXQuY29tL1wiLFxuICAgIFwiaHR0cDovL2toYWxlZWpjaGF0LmNvbS9cIixcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHBhZ2U6UGFnZSwgcHJpdmF0ZSBjb25uZWN0OkNvbm5lY3Rpb24sIHB1YmxpYyByb3V0ZXI6Um91dGVyKXtcbiAgICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbm5lY3Rpb24oKXtcbiAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICAgICAgdmFyIHNlcnZlcjpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJpcFwiKTtcbiAgICAgICAgdmFyIHVzZXJuYW1lOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInVzZXJuYW1lXCIpO1xuICAgICAgICB2YXIgcGFzc3dvcmQ6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwicGFzc3dvcmRcIik7XG4gICAgICAgIHZhciBwYXNzd29yZDpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJwYXNzd29yZFwiKTtcblxuICAgICAgICB2YXIgbGlzdHBpY2tlcjpMaXN0UGlja2VyID0gPExpc3RQaWNrZXI+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInNlcnZlcnNsaXN0XCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Quc2VydmVyID0gdGhpcy5zZXJ2ZXJzW2xpc3RwaWNrZXIuc2VsZWN0ZWRJbmRleF07XG5cbiAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldCA9IGNvbm5lY3QodGhpcy5jb25uZWN0LnNlcnZlciwgPFNvY2tldE9wdGlvbnM+IHsgdHJhbnNwb3J0czogWydwb2xsaW5nJywgJ3dlYnNvY2tldCddIH0pO1xuICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdjb25uZWN0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9iq2YUg2KfZhNin2KrYtdin2YQg2KjZhtis2KfYrScpKTtcblxuICAgICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiBcImxvZ2luXCIgLCBkYXRhOntcbiAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZS50ZXh0LFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLnRleHQsXG4gICAgICAgICAgICBzdGVhbHRoOiB0cnVlLFxuICAgICAgICAgICAgZnA6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICAgICAgcmVmcjogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgICAgICByOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lXG4gICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ21haW4nXSk7ICAgICAgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWycnXSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=