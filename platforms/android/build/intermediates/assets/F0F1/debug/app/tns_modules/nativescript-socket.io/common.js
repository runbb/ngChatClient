"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocketBase {
    constructor() {
        this._listeners = new WeakMap();
    }
    get disconnected() {
        return !this.connected;
    }
    open() {
        this.connect();
    }
    close() {
        this.disconnect();
    }
    addEventListener(event, callback) {
        return this.on(event, callback);
    }
    removeListener(event, callback) {
        return this.off(event, callback);
    }
    removeEventListener(event, callback) {
        return this.off(event, callback);
    }
}
exports.SocketBase = SocketBase;
exports.debugNop = function (...args) { };
function debugDefault(...args) {
    args = args.map((value) => {
        if (typeof value === 'object' && value) {
            try {
                value = JSON.stringify(value);
            }
            catch (e) {
                value = value.toString();
            }
        }
        return value;
    });
    args.unshift('nativescript-socket.io');
    console.log.apply(console, args);
}
exports.debugDefault = debugDefault;
let _debug = exports.debugNop;
function debug(...args) {
    _debug.apply(null, args);
}
exports.debug = debug;
function enableDebug(debugFn = debugDefault) {
    _debug = debugFn;
}
exports.enableDebug = enableDebug;
function disableDebug() {
    _debug = exports.debugNop;
}
exports.disableDebug = disableDebug;
//# sourceMappingURL=common.js.map