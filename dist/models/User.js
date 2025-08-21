"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, email, username, client, password) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.client = client;
        this.password = password;
    }
}
exports.User = User;
