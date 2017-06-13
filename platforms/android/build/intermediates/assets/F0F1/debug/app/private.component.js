"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var page_1 = require("ui/page");
var connection_1 = require("./services/connection");
var PrivateComponent = (function () {
    function PrivateComponent(page, connect) {
        this.page = page;
        this.connect = connect;
    }
    PrivateComponent.prototype.refresh = function () { };
    return PrivateComponent;
}());
PrivateComponent = __decorate([
    core_1.Component({
        selector: "my-app",
        templateUrl: './private.component.html',
    }),
    __metadata("design:paramtypes", [page_1.Page, connection_1.Connection])
], PrivateComponent);
exports.PrivateComponent = PrivateComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmF0ZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcml2YXRlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUEwQztBQUMxQyxnQ0FBK0I7QUFFL0Isb0RBQW1EO0FBTW5ELElBQWEsZ0JBQWdCO0lBQ3pCLDBCQUFvQixJQUFTLEVBQVUsT0FBa0I7UUFBckMsU0FBSSxHQUFKLElBQUksQ0FBSztRQUFVLFlBQU8sR0FBUCxPQUFPLENBQVc7SUFBRyxDQUFDO0lBRTdELGtDQUFPLEdBQVAsY0FBVSxDQUFDO0lBQ2YsdUJBQUM7QUFBRCxDQUFDLEFBSkQsSUFJQztBQUpZLGdCQUFnQjtJQUo1QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLDBCQUEwQjtLQUN4QyxDQUFDO3FDQUUyQixXQUFJLEVBQWtCLHVCQUFVO0dBRGhELGdCQUFnQixDQUk1QjtBQUpZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcblxuaW1wb3J0IHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL3NlcnZpY2VzL2Nvbm5lY3Rpb25cIjtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICB0ZW1wbGF0ZVVybDogJy4vcHJpdmF0ZS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIFByaXZhdGVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFnZTpQYWdlICxwcml2YXRlIGNvbm5lY3Q6Q29ubmVjdGlvbikge31cblxuICAgIHJlZnJlc2goKXt9XG59Il19