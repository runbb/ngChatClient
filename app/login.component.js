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
        this.connect.socket.on('error', function (err) {
            dialogs.alert({
                title: "خطأ",
                message: err,
                okButtonText: "حسنا"
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQTBDO0FBQzFDLDBDQUF5QztBQUN6QyxpRUFBK0Q7QUFDL0QsZ0NBQStCO0FBTS9CLG9EQUFtRDtBQUVuRCxvQ0FBdUM7QUFJdkM7SUFDRSxpQkFBbUIsRUFBUyxFQUFTLE1BQWEsRUFBUyxLQUFZLEVBQVEsR0FBVSxFQUFRLElBQVcsRUFBUSxPQUFjLEVBQy9HLFVBQWlCLEVBQVEsS0FBWSxFQUFRLFlBQW1CO1FBRGhFLE9BQUUsR0FBRixFQUFFLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFPO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLFFBQUcsR0FBSCxHQUFHLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztRQUMvRyxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFRLGlCQUFZLEdBQVosWUFBWSxDQUFPO0lBQUUsQ0FBQztJQUN4RixjQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUNFLHNCQUFtQixLQUFZLEVBQVEsT0FBYztRQUFsQyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFFLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQztBQU1ELElBQWEsY0FBYztJQU92Qix3QkFBbUIsSUFBUyxFQUFVLE9BQWtCLEVBQVMsTUFBYTtRQUEzRCxTQUFJLEdBQUosSUFBSSxDQUFLO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBVztRQUFTLFdBQU0sR0FBTixNQUFNLENBQU87UUFOOUUsWUFBTyxHQUFhO1lBQ2hCLGtCQUFrQjtZQUNsQixxQkFBcUI7WUFDckIseUJBQXlCO1NBQzVCLENBQUM7UUFHRSxJQUFJLENB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QWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgY29ubmVjdCxTb2NrZXRPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1zb2NrZXQuaW9cIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcInVpL3RleHQtZmllbGRcIjtcbmltcG9ydCB7IExpc3RQaWNrZXIgfSBmcm9tIFwidWkvbGlzdC1waWNrZXJcIjtcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0aW1lcic7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IENvbm5lY3Rpb24gfSBmcm9tIFwiLi9zZXJ2aWNlcy9jb25uZWN0aW9uXCI7XG5cbmltcG9ydCBkaWFsb2dzID0gcmVxdWlyZShcInVpL2RpYWxvZ3NcIik7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibXktYXBwXCIsXG4gIHRlbXBsYXRlVXJsOiAnbG9naW4uY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIExvZ2luQ29tcG9uZW50e1xuICAgIHNlcnZlcnM6IHN0cmluZ1tdID0gW1xuICAgICAgICBcImh0dHA6Ly8zY2g4LmNvbS9cIixcbiAgICAgICAgXCJodHRwOi8vZmxoY2hhdC5jb20vXCIsXG4gICAgICAgIFwiaHR0cDovL2toYWxlZWpjaGF0LmNvbS9cIixcbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHBhZ2U6UGFnZSwgcHJpdmF0ZSBjb25uZWN0OkNvbm5lY3Rpb24sIHB1YmxpYyByb3V0ZXI6Um91dGVyKXtcbiAgICAgICAgdGhpcy5jb25uZWN0Lm1lc3NhZ2VzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5ub3RpZmljYXRpb25zID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC51c2VycyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QucG93ZXJzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5icm9hZGNhc3RzID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdC5yb29tcyA9IFtdO1xuICAgICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQoZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbm5lY3Rpb24odHlwZTogc3RyaW5nKXtcbiAgICAgICAgdGhpcy5jb25uZWN0LmNvbm5lY3RlZC5uZXh0KGZhbHNlKTtcbiAgICAgICAgdmFyIHNlcnZlcjpUZXh0RmllbGQgPSA8VGV4dEZpZWxkPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJpcFwiKTtcbiAgICAgICAgdmFyIHVzZXJuYW1lOlRleHRGaWVsZCA9IDxUZXh0RmllbGQ+IHRoaXMucGFnZS5nZXRWaWV3QnlJZChcInVzZXJuYW1lXCIpO1xuICAgICAgICB2YXIgcGFzc3dvcmQ6VGV4dEZpZWxkID0gPFRleHRGaWVsZD4gdGhpcy5wYWdlLmdldFZpZXdCeUlkKFwicGFzc3dvcmRcIik7XG5cbiAgICAgICAgdmFyIGxpc3RwaWNrZXI6TGlzdFBpY2tlciA9IDxMaXN0UGlja2VyPiB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoXCJzZXJ2ZXJzbGlzdFwiKTtcbiAgICAgICAgdGhpcy5jb25uZWN0LnNlcnZlciA9IHRoaXMuc2VydmVyc1tsaXN0cGlja2VyLnNlbGVjdGVkSW5kZXhdO1xuICAgICAgICBcbiAgICAgICAgaWYodXNlcm5hbWUudGV4dC50cmltKCkgPT0gJycgfHwgcGFzc3dvcmQudGV4dC50cmltKCkgPT0gJycpe1xuICAgICAgICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcItiu2LfYo1wiLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAn2YrYrNioINi52K/ZhSDYqtix2YMg2KfYrdivINin2YTYrdmC2YjZhCDZgdin2LHYutmL2KcnLFxuICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwi2K3Ys9mG2KdcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbm5lY3Quc29ja2V0ID0gY29ubmVjdCh0aGlzLmNvbm5lY3Quc2VydmVyLCA8U29ja2V0T3B0aW9ucz4geyB0cmFuc3BvcnRzOiBbJ3BvbGxpbmcnLCAnd2Vic29ja2V0J10gfSk7XG4gICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QuY29ubmVjdGVkLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Qubm90aWZpY2F0aW9ucy51bnNoaWZ0KG5ldyBOb3RpZmljYXRpb24odGhpcy5jb25uZWN0LnNlcnZlciArICdwaWMucG5nJywn2KrZhSDYp9mE2KfYqti12KfZhCDYqNmG2KzYp9itJykpO1xuICAgICAgICAgICAgaWYodHlwZSA9PSAndXNlcicpe1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQuZW1pdCgnbXNnJywge2NtZDogXCJsb2dpblwiICwgZGF0YTp7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgc3RlYWx0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZnA6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsIFxuICAgICAgICAgICAgICAgICAgICByZWZyOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lLCBcbiAgICAgICAgICAgICAgICAgICAgcjogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdXByb2ZpbGU6IHt9XG4gICAgICAgICAgICAgICAgfX0pO1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnbWFpbiddKTtcbiAgICAgICAgICAgIH1lbHNlIGlmKHR5cGUgPT0gJ2d1ZXN0Jyl7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0LnNvY2tldC5lbWl0KCdtc2cnLCB7Y21kOiBcImxvZ2luXCIgLCBkYXRhOntcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLnRleHQsXG4gICAgICAgICAgICAgICAgICAgIGZwOiB0aGlzLmNvbm5lY3QuY29ubmVjdGlvbl9uYW1lLCBcbiAgICAgICAgICAgICAgICAgICAgcmVmcjogdGhpcy5jb25uZWN0LmNvbm5lY3Rpb25fbmFtZSwgXG4gICAgICAgICAgICAgICAgICAgIHI6IHRoaXMuY29ubmVjdC5jb25uZWN0aW9uX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVwcm9maWxlOiB7fVxuICAgICAgICAgICAgICAgIH19KTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ21haW4nXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdC5zb2NrZXQub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgZGlhbG9ncy5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiBcItiu2LfYo1wiLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBlcnIsXG4gICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogXCLYrdiz2YbYp1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==