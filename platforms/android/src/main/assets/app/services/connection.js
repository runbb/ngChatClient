"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
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
var Connection = (function () {
    function Connection() {
        this.server = "";
        this.app_name = "دردشة عشق الخليج";
        this.connected = new rxjs_1.Subject();
        this.connection_name = "Android Application";
    }
    return Connection;
}());
Connection = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], Connection);
exports.Connection = Connection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBcUQ7QUFPckQsNkJBQTJDO0FBTTNDLDhCQUFpQztBQUlqQztJQUNFLGlCQUFtQixFQUFTLEVBQVMsTUFBYSxFQUFTLEtBQVksRUFBUSxHQUFVLEVBQVEsSUFBVyxFQUFRLE9BQWMsRUFDL0csVUFBaUIsRUFBUSxLQUFZLEVBQVEsWUFBbUI7UUFEaEUsT0FBRSxHQUFGLEVBQUUsQ0FBTztRQUFTLFdBQU0sR0FBTixNQUFNLENBQU87UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsUUFBRyxHQUFILEdBQUcsQ0FBTztRQUFRLFNBQUksR0FBSixJQUFJLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO1FBQy9HLGVBQVUsR0FBVixVQUFVLENBQU87UUFBUSxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsaUJBQVksR0FBWixZQUFZLENBQU87SUFBRSxDQUFDO0lBQ3hGLGNBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUVEO0lBQ0Usc0JBQW1CLEtBQVksRUFBUSxPQUFjO1FBQWxDLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO0lBQUUsQ0FBQztJQUMxRCxtQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQsbUJBQW1CLElBQVc7SUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxHQUFHLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBR0QsSUFBYSxVQUFVO0lBaUJyQjtRQVJPLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFJcEIsYUFBUSxHQUFXLGtCQUFrQixDQUFDO1FBQ3RDLGNBQVMsR0FBcUIsSUFBSSxjQUFPLEVBQVcsQ0FBQztRQUNyRCxvQkFBZSxHQUFXLHFCQUFxQixDQUFDO0lBRXpDLENBQUM7SUFFakIsaUJBQUM7QUFBRCxDQUFDLEFBbkJELElBbUJDO0FBbkJZLFVBQVU7SUFEdEIsaUJBQVUsRUFBRTs7R0FDQSxVQUFVLENBbUJ0QjtBQW5CWSxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCxJbmplY3RhYmxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGNvbm5lY3QsU29ja2V0T3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtc29ja2V0LmlvXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCB7IExpc3RWaWV3IH0gZnJvbSBcInVpL2xpc3Qtdmlld1wiO1xuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcInVpL3RleHQtZmllbGRcIjtcbmltcG9ydCB7IFRhYlZpZXdJdGVtIH0gZnJvbSBcInVpL3RhYi12aWV3XCI7XG5pbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSAndGltZXInO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwiYXBwbGljYXRpb25cIjtcbmltcG9ydCAqIGFzIHBsYXRmb3JtIGZyb20gXCJwbGF0Zm9ybVwiO1xuXG5pbXBvcnQgZGlhbG9ncyA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xuaW1wb3J0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZVwiKTtcblxuZGVjbGFyZSB2YXIgTlNJbmRleFBhdGgsVUlUYWJsZVZpZXdTY3JvbGxQb3NpdGlvbix1bmVzY2FwZSxhbmRyb2lkO1xuXG5jbGFzcyBNZXNzYWdle1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6c3RyaW5nLCBwdWJsaWMgYXZhdGFyOnN0cmluZywgcHVibGljIHBvd2VyOnN0cmluZyxwdWJsaWMgZHIzOnN0cmluZyxwdWJsaWMgZnJvbTpzdHJpbmcscHVibGljIG1lc3NhZ2U6c3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgYmFja2dyb3VuZDpzdHJpbmcscHVibGljIGNvbG9yOnN0cmluZyxwdWJsaWMgbWVzc2FnZUNvbG9yOnN0cmluZyl7fVxufVxuXG5jbGFzcyBOb3RpZmljYXRpb257XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbWFnZTpzdHJpbmcscHVibGljIG1lc3NhZ2U6c3RyaW5nKXt9XG59XG5cbmZ1bmN0aW9uIF91bmVzY2FwZShjb2RlOnN0cmluZyk6IHN0cmluZ3tcbiAgcmV0dXJuIF8udW5lc2NhcGUoY29kZSkucmVwbGFjZSgvJiN4M0M7LywnPCcpO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbiB7XG4gIHB1YmxpYyBtZXNzYWdlczogQXJyYXk8TWVzc2FnZT47XG4gIHB1YmxpYyBicm9hZGNhc3RzOiBBcnJheTxNZXNzYWdlPjtcbiAgcHVibGljIG5vdGlmaWNhdGlvbnM6IEFycmF5PE5vdGlmaWNhdGlvbj47XG4gIHB1YmxpYyB1c2VyczogQXJyYXk8YW55PjtcbiAgcHVibGljIHVzZXI6IGFueTtcbiAgcHVibGljIHJvb21zOiBBcnJheTxhbnk+O1xuICBwdWJsaWMgcm9vbTogYW55O1xuICBwdWJsaWMgcG93ZXJzOiBBcnJheTxhbnk+O1xuICBwdWJsaWMgc2VydmVyOiBzdHJpbmcgPSBcIlwiO1xuXG4gIHB1YmxpYyBzb2NrZXQ7XG4gIHB1YmxpYyB1c2VyaWQ6IHN0cmluZztcbiAgcHVibGljIGFwcF9uYW1lOiBzdHJpbmcgPSBcItiv2LHYr9i02Kkg2LnYtNmCINin2YTYrtmE2YrYrFwiO1xuICBwdWJsaWMgY29ubmVjdGVkOiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHVibGljIGNvbm5lY3Rpb25fbmFtZTogc3RyaW5nID0gXCJBbmRyb2lkIEFwcGxpY2F0aW9uXCI7XG4gIFxuICBjb25zdHJ1Y3Rvcigpe31cblxufSJdfQ==