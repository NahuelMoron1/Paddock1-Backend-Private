"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, fullName, email, password, phone, userID, role, status, socialworkID, directions) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.userID = userID;
        this.role = role;
        this.status = status;
        this.socialworkID = socialworkID;
        this.directions = directions;
    }
}
exports.User = User;
