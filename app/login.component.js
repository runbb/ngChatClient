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
    LoginComponent.prototype.connection = function (type) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQTBDO0FBQzFDLDBDQUF5QztBQUN6QyxpRUFBK0Q7QUFDL0QsZ0NBQStCO0FBTS9CLG9EQUFtRDtBQUluRDtJQUNFLGlCQUFtQixFQUFTLEVBQVMsTUFBYSxFQUFTLEtBQVksRUFBUSxHQUFVLEVBQVEsSUFBVyxFQUFRLE9BQWMsRUFDL0csVUFBaUIsRUFBUSxLQUFZLEVBQVEsWUFBbUI7UUFEaEUsT0FBRSxHQUFGLEVBQUUsQ0FBTztRQUFTLFdBQU0sR0FBTixNQUFNLENBQU87UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsUUFBRyxHQUFILEdBQUcsQ0FBTztRQUFRLFNBQUksR0FBSixJQUFJLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO1FBQy9HLGVBQVUsR0FBVixVQUFVLENBQU87UUFBUSxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsaUJBQVksR0FBWixZQUFZLENBQU87SUFBRSxDQUFDO0lBQ3hGLGNBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUVEO0lBQ0Usc0JBQW1CLEtBQVksRUFBUSxPQUFjO1FBQWxDLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO0lBQUUsQ0FBQztJQUMxRCxtQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBTUQsSUFBYSxjQUFjO0lBT3ZCLHdCQUFtQixJQUFTLEVBQVUsT0FBa0IsRUFBUyxNQUFhO1FBQTNELFNBQUksR0FBSixJQUFJLENBQUs7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFXO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBTztRQU45RSxZQUFPLEdBQWE7WUFDaEIsa0JBQWtCO1lBQ2xCLHFCQUFxQjtZQUNyQix5QkFBeUI7U0FDNUIsQ0FBQztRQUdFLElBQUksQ0FBQyxPQUFPLENBQUMs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LEdBQUcsRUFBRSxPQUFPLEVBQUcsSUFBSSxFQUFDO3dCQUNqRCxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUk7d0JBQ3ZCLEVBQUUsRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLGVBQWU7d0JBQ2hDLElBQUksRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLGVBQWU7d0JBQ2xDLENBQUMsRUFBRSxLQUFJLENBQUMsT0FBTyxDQUFDLGVBQWU7d0JBQy9CLFFBQVEsRUFBRSxFQUFFO3FCQUNmLEVBQUMsQ0FBQyxDQUFDO2dCQUNKLEtBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO1lBQzVCLEtBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUExREQsSUEwREM7QUExRFksY0FBYztJQUoxQixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLHNCQUFzQjtLQUNwQyxDQUFDO3FDQVEwQixXQUFJLEVBQWtCLHVCQUFVLEVBQWdCLGVBQU07R0FQckUsY0FBYyxDQTBEMUI7QUExRFksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcInVpL3RleHQtZmllbGRcIjtcbmltcG9ydCB7IExpc3RQaWNrZXIgfSBmcm9tIFwidWkvbGlzdC1waWNrZXJcIjtcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0aW1lcic7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IENvbm5lY3Rpb24gfSBmcm9tIFwiLi9zZXJ2aWNlcy9jb25uZWN0aW9uXCI7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibXktYXBwXCIsXG4gIHRlbXBsYXRlVXJsOiAnbG9naW4uY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIExvZ2luQ29tcG9uZW50e1xuICAgIHNlcnZlcnM6IHN0cmluZ1tdID0gW1xuICAgICAgICBcImh0dHA6Ly8zY2g4LmNvbS9cIixcbiAgICAgICAgXCJodHRwOi8vZmxoY2hhdC5jb20vXCIsXG4gICAgICAgIFwiaHR0cDovL2toYWxlZWpjaGF0LmNvbS9cIixcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHBhZ2U6UGFnZSwgcHJpdmF0ZSBjb25uZWN0OkNvbm5lY3Rpb24sIHB1YmxpYyByb3V0ZXI6Um91dGVyKXtcbiAgICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbm5lY3Rpb24odHlwZTogc3RyaW5nKXtcbiAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICAgICAgdmFyIHNlcnZlcjpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJpcFwiKTtcbiAgICAgICAgdmFyIHVzZXJuYW1lOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInVzZXJuYW1lXCIpO1xuICAgICAgICB2YXIgcGFzc3dvcmQ6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwicGFzc3dvcmRcIik7XG4gICAgICAgIHZhciBwYXNzd29yZDpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJwYXNzd29yZFwiKTtcblxuICAgICAgICB2YXIgbGlzdHBpY2tlcjpMaXN0UGlja2VyID0gPExpc3RQaWNrZXI+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInNlcnZlcnNsaXN0XCIpO1xuICAgICAgICB0aGlzLmNvbm5lY3Quc2VydmVyID0gdGhpcy5zZXJ2ZXJzW2xpc3RwaWNrZXIuc2VsZWN0ZWRJbmRleF07XG5cbiAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldCA9IGNvbm5lY3QodGhpcy5jb25uZWN0LnNlcnZlciwgPFNvY2tldE9wdGlvbnM+IHsgdHJhbnNwb3J0czogWydwb2xsaW5nJywgJ3dlYnNvY2tldCddIH0pO1xuICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdjb25uZWN0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0Lm5vdGlmaWNhdGlvbnMudW5zaGlmdChuZXcgTm90aWZpY2F0aW9uKHRoaXMuY29ubmVjdC5zZXJ2ZXIgKyAncGljLnBuZycsJ9iq2YUg2KfZhNin2KrYtdin2YQg2KjZhtis2KfYrScpKTtcbiAgICAgICAgICAgIGlmKHR5cGUgPT0gJ3VzZXInKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0LmVtaXQoJ21zZycsIHtjbWQ6IFwibG9naW5cIiAsIGRhdGE6e1xuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHN0ZWFsdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZwOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lLCBcbiAgICAgICAgICAgICAgICAgICAgcmVmcjogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgICAgICAgICAgICAgIHI6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVwcm9maWxlOiB7fVxuICAgICAgICAgICAgICAgIH19KTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ21haW4nXSk7XG4gICAgICAgICAgICB9ZWxzZSBpZih0eXBlID09ICdndWVzdCcpe1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdCgnbXNnJywge2NtZDogXCJsb2dpblwiICwgZGF0YTp7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBmcDogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgICAgICAgICAgICAgIHJlZnI6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICAgICAgICAgICAgICByOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lLFxuICAgICAgICAgICAgICAgICAgICB1cHJvZmlsZToge31cbiAgICAgICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydtYWluJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0Lm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnJ10pO1xuICAgICAgICB9KTtcbiAgICB9XG59Il19