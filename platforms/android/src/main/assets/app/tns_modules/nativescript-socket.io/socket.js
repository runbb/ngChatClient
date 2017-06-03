'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
exports.enableDebug = common_1.enableDebug;
exports.disableDebug = common_1.disableDebug;
const helpers_1 = require("./helpers");
const _Emitter = io.socket.emitter.Emitter;
const _IO = io.socket.client.IO;
const _Socket = io.socket.client.Socket;
const _Ack = io.socket.client.Ack;
const SOCKET_CLASS = 'io.socket.client.Socket';
class Socket extends common_1.SocketBase {
    constructor(uri, options = {}) {
        super();
        let _options = new _IO.Options();
        if (options.query) {
            if (typeof options.query === 'string') {
                _options.query = options.query;
            }
            else {
                _options.query = Object.keys(options.query).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(options.query[key]);
                }).join('&');
            }
        }
        if (options.android) {
            Object.keys(options.android).forEach(function (prop) {
                _options[prop] = options.android[prop];
            });
        }
        this.android = _IO.socket(uri, _options);
    }
    get connected() {
        return this.android && this.android.connected();
    }
    connect() {
        this.android.connect();
    }
    disconnect() {
        this.android.disconnect();
    }
    on(event, callback) {
        let listener = function (args) {
            let payload = Array.prototype.slice.call(args);
            let ack = payload.pop();
            if (typeof ack === 'undefined') {
                ack = null;
            }
            else if (typeof ack === 'object' && ack && !(ack.getClass().getName().indexOf(SOCKET_CLASS) === 0 && ack.call)) {
                payload.push(ack);
                ack = null;
            }
            payload = payload.map(helpers_1.deserialize);
            common_1.debug('on', event, payload, ack ? 'ack' : '');
            if (ack) {
                let _ack = function (...args) {
                    common_1.debug('on', event, 'ack', args);
                    args = args.map(helpers_1.serialize);
                    ack.call(args);
                };
                payload.push(_ack);
            }
            callback.apply(null, payload);
        };
        listener = new _Emitter.Listener({
            call: listener,
        });
        this._listeners.set(callback, listener);
        this.android.on(event, listener);
        return this;
    }
    once(event, callback) {
        let listener = function (args) {
            let payload = Array.prototype.slice.call(args);
            let ack = payload.pop();
            if (typeof ack === 'undefined') {
                ack = null;
            }
            else if (typeof ack === 'object' && ack && !(ack.getClass().getName().indexOf(SOCKET_CLASS) === 0 && ack.call)) {
                payload.push(ack);
                ack = null;
            }
            payload = payload.map(helpers_1.deserialize);
            common_1.debug('once', event, payload, ack ? 'ack' : '');
            if (ack) {
                let _ack = function (...args) {
                    common_1.debug('once', event, 'ack', args);
                    args = args.map(helpers_1.serialize);
                    ack.call(args);
                };
                payload.push(_ack);
            }
            callback.apply(null, payload);
        };
        listener = new _Emitter.Listener({
            call: listener,
        });
        this._listeners.set(callback, listener);
        this.android.once(event, listener);
        return this;
    }
    off(event, callback) {
        common_1.debug('off', event, callback);
        if (callback) {
            let listener = this._listeners.get(callback);
            if (listener) {
                this.android.off(event, listener);
                this._listeners.delete(callback);
            }
        }
        else {
            this.android.off(event);
        }
        return this;
    }
    emit(event, ...payload) {
        let ack = payload.pop();
        if (typeof ack === 'undefined') {
            ack = null;
        }
        else if (typeof ack !== 'function') {
            payload.push(ack);
            ack = null;
        }
        common_1.debug('emit', event, payload, ack ? 'ack' : '');
        payload = payload.map(helpers_1.serialize);
        if (ack) {
            let _ack = function (args) {
                args = Array.prototype.slice.call(args).map(helpers_1.deserialize);
                common_1.debug('emit', event, 'ack', args);
                ack.apply(null, args);
            };
            _ack = new _Ack({
                call: _ack,
            });
            payload.push(_ack);
        }
        this.android.emit(event, payload);
        return this;
    }
    removeAllListeners() {
        this.android.off();
        return this;
    }
}
exports.Socket = Socket;
function connect(uri, options) {
    let socket = new Socket(uri, options || {});
    socket.connect();
    return socket;
}
exports.connect = connect;
//# sourceMappingURL=socket.js.map