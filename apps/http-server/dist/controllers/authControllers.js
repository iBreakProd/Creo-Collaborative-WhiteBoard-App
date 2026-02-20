"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupController = signupController;
exports.signinController = signinController;
exports.signoutController = signoutController;
exports.infoController = infoController;
const client_1 = require("@workspace/db/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const common_1 = require("@workspace/common");
const drizzle_orm_1 = require("drizzle-orm");
function signupController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const inputValidator = common_1.UserSignupSchema;
        const validatedInput = inputValidator.safeParse(req.body);
        if (validatedInput.error) {
            res.status(404).json({
                message: "Invalid Inputs",
            });
            return;
        }
        try {
            const saltrounds = parseInt(process.env.SALTROUNDS || "10");
            const hashedPwd = yield bcrypt_1.default.hash(validatedInput.data.password, saltrounds);
            const userCreated = yield client_1.db.insert(client_1.usersTable).values({
                username: validatedInput.data.username,
                password: hashedPwd,
                name: validatedInput.data.name,
            }).returning();
            const user = {
                id: (_a = userCreated[0]) === null || _a === void 0 ? void 0 : _a.id,
                username: (_b = userCreated[0]) === null || _b === void 0 ? void 0 : _b.username,
                name: (_c = userCreated[0]) === null || _c === void 0 ? void 0 : _c.name,
                photo: (_d = userCreated[0]) === null || _d === void 0 ? void 0 : _d.photo,
            };
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET || "kjhytfrde45678iuytrfdcfgy6tr");
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.json({
                message: "User Signed Up",
                user,
                token,
            });
            return;
        }
        catch (e) {
            console.log(e);
            // Drizzle wraps Postgres errors, so the actual code is usually in e.cause
            const dbError = e.cause || e;
            if (dbError.code === "23505" || ((_e = e.message) === null || _e === void 0 ? void 0 : _e.includes("23505")) || ((_f = dbError.message) === null || _f === void 0 ? void 0 : _f.includes("duplicate key value violates unique constraint"))) {
                res.status(409).json({
                    message: "Username is already taken. Please choose another one.",
                });
                return;
            }
            res.status(500).json({
                message: "Unable to create your account right now. Please try again.",
            });
        }
    });
}
function signinController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputValidator = common_1.UserSigninSchema;
        const validatedInput = inputValidator.safeParse(req.body);
        if (validatedInput.error) {
            res.status(404).json({
                message: "Invalid Inputs",
            });
            return;
        }
        try {
            const userResult = yield client_1.db.select().from(client_1.usersTable).where((0, drizzle_orm_1.eq)(client_1.usersTable.username, validatedInput.data.username));
            const userFound = userResult[0];
            if (!userFound) {
                res.status(404).json({
                    message: "The username does not exist",
                });
                return;
            }
            const validatedPassword = yield bcrypt_1.default.compare(validatedInput.data.password, userFound.password);
            if (!validatedPassword) {
                res.status(404).json({
                    message: "The password is incorrect",
                });
                return;
            }
            const user = {
                id: userFound.id,
                username: userFound.username,
                name: userFound.name,
                photo: userFound.photo,
            };
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET || "kjhytfrde45678iuytrfdcfgy6tr");
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.json({
                message: "User Signed In",
                user: user,
                token,
            });
            return;
        }
        catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Unable to sign you in at the moment. Please try again later.",
            });
        }
    });
}
function signoutController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.clearCookie("jwt");
        res.json({
            message: "User logged out",
        });
    });
}
function infoController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                message: "User Id not found",
            });
            return;
        }
        try {
            const userResult = yield client_1.db.select().from(client_1.usersTable).where((0, drizzle_orm_1.eq)(client_1.usersTable.id, userId));
            const userFound = userResult[0];
            const user = {
                id: userFound === null || userFound === void 0 ? void 0 : userFound.id,
                username: userFound === null || userFound === void 0 ? void 0 : userFound.username,
                name: userFound === null || userFound === void 0 ? void 0 : userFound.name,
            };
            res.status(200).json({
                message: "User info",
                user,
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Unable to retrieve your profile information. Please refresh.",
            });
        }
    });
}
