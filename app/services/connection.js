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
        this.app_name = "دردشة الخليج";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBcUQ7QUFPckQsNkJBQTJDO0FBTTNDLDhCQUFpQztBQUlqQztJQUNFLGlCQUFtQixFQUFTLEVBQVMsTUFBYSxFQUFTLEtBQVksRUFBUSxHQUFVLEVBQVEsSUFBVyxFQUFRLE9BQWMsRUFDL0csVUFBaUIsRUFBUSxLQUFZLEVBQVEsWUFBbUI7UUFEaEUsT0FBRSxHQUFGLEVBQUUsQ0FBTztRQUFTLFdBQU0sR0FBTixNQUFNLENBQU87UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsUUFBRyxHQUFILEdBQUcsQ0FBTztRQUFRLFNBQUksR0FBSixJQUFJLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO1FBQy9HLGVBQVUsR0FBVixVQUFVLENBQU87UUFBUSxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsaUJBQVksR0FBWixZQUFZLENBQU87SUFBRSxDQUFDO0lBQ3hGLGNBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUVEO0lBQ0Usc0JBQW1CLEtBQVksRUFBUSxPQUFjO1FBQWxDLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxZQUFPLEdBQVAsT0FBTyxDQUFPO0lBQUUsQ0FBQztJQUMxRCxtQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQsbUJBQW1CLElBQVc7SUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxHQUFHLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBR0QsSUFBYSxVQUFVO0lBaUJyQjtRQVJPLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFJcEIsYUFBUSxHQUFXLGNBQWMsQ0FBQztRQUNsQyxjQUFTLEdBQXFCLElBQUksY0FBTyxFQUFXLENBQUM7UUFDckQsb0JBQWUsR0FBVyxxQkFBcUIsQ0FBQztJQUV6QyxDQUFDO0lBRWpCLGlCQUFDO0FBQUQsQ0FBQyxBQW5CRCxJQW1CQztBQW5CWSxVQUFVO0lBRHRCLGlCQUFVLEVBQUU7O0dBQ0EsVUFBVSxDQW1CdEI7QUFuQlksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBjb25uZWN0LFNvY2tldE9wdGlvbnMgfSBmcm9tIFwibmF0aXZlc2NyaXB0LXNvY2tldC5pb1wiO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQgeyBMaXN0VmlldyB9IGZyb20gXCJ1aS9saXN0LXZpZXdcIjtcbmltcG9ydCB7IFRleHRGaWVsZCB9IGZyb20gXCJ1aS90ZXh0LWZpZWxkXCI7XG5pbXBvcnQgeyBUYWJWaWV3SXRlbSB9IGZyb20gXCJ1aS90YWItdmlld1wiO1xuaW1wb3J0IHsgc2V0VGltZW91dCB9IGZyb20gJ3RpbWVyJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcImFwcGxpY2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tIFwicGxhdGZvcm1cIjtcblxuaW1wb3J0IGRpYWxvZ3MgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcbmltcG9ydCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmVcIik7XG5cbmRlY2xhcmUgdmFyIE5TSW5kZXhQYXRoLFVJVGFibGVWaWV3U2Nyb2xsUG9zaXRpb24sdW5lc2NhcGUsYW5kcm9pZDtcblxuY2xhc3MgTWVzc2FnZXtcbiAgY29uc3RydWN0b3IocHVibGljIGlkOnN0cmluZywgcHVibGljIGF2YXRhcjpzdHJpbmcsIHB1YmxpYyBwb3dlcjpzdHJpbmcscHVibGljIGRyMzpzdHJpbmcscHVibGljIGZyb206c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGJhY2tncm91bmQ6c3RyaW5nLHB1YmxpYyBjb2xvcjpzdHJpbmcscHVibGljIG1lc3NhZ2VDb2xvcjpzdHJpbmcpe31cbn1cblxuY2xhc3MgTm90aWZpY2F0aW9ue1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW1hZ2U6c3RyaW5nLHB1YmxpYyBtZXNzYWdlOnN0cmluZyl7fVxufVxuXG5mdW5jdGlvbiBfdW5lc2NhcGUoY29kZTpzdHJpbmcpOiBzdHJpbmd7XG4gIHJldHVybiBfLnVuZXNjYXBlKGNvZGUpLnJlcGxhY2UoLyYjeDNDOy8sJzwnKTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb24ge1xuICBwdWJsaWMgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2U+O1xuICBwdWJsaWMgYnJvYWRjYXN0czogQXJyYXk8TWVzc2FnZT47XG4gIHB1YmxpYyBub3RpZmljYXRpb25zOiBBcnJheTxOb3RpZmljYXRpb24+O1xuICBwdWJsaWMgdXNlcnM6IEFycmF5PGFueT47XG4gIHB1YmxpYyB1c2VyOiBhbnk7XG4gIHB1YmxpYyByb29tczogQXJyYXk8YW55PjtcbiAgcHVibGljIHJvb206IGFueTtcbiAgcHVibGljIHBvd2VyczogQXJyYXk8YW55PjtcbiAgcHVibGljIHNlcnZlcjogc3RyaW5nID0gXCJcIjtcblxuICBwdWJsaWMgc29ja2V0O1xuICBwdWJsaWMgdXNlcmlkOiBzdHJpbmc7XG4gIHB1YmxpYyBhcHBfbmFtZTogc3RyaW5nID0gXCLYr9ix2K/YtNipINin2YTYrtmE2YrYrFwiO1xuICBwdWJsaWMgY29ubmVjdGVkOiBTdWJqZWN0PGJvb2xlYW4+ID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgcHVibGljIGNvbm5lY3Rpb25fbmFtZTogc3RyaW5nID0gXCJBbmRyb2lkIEFwcGxpY2F0aW9uXCI7XG4gIFxuICBjb25zdHJ1Y3Rvcigpe31cblxufSJdfQ==