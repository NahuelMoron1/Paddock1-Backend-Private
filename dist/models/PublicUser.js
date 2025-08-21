"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicUser = void 0;
class PublicUser {
    constructor(id, email, username, client) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.client = client;
    }
}
exports.PublicUser = PublicUser;
