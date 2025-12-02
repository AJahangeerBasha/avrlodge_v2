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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path = require("path");
var firebaseConfig_1 = require("./firebaseConfig");
var firestore_1 = require("firebase/firestore");
// Small helper: safe number parse
function toNumber(value) {
    if (!value)
        return 0;
    var n = Number(value.toString().trim());
    return Number.isFinite(n) ? n : 0;
}
var DRY_RUN = process.argv.includes('--dry');
var _dryCounter = 0;
function maybeAdd(collectionName, data) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (DRY_RUN) {
                        _dryCounter += 1;
                        console.log("    [DRY] Would add to ".concat(collectionName, ":"), data);
                        return [2 /*return*/, { id: "dry-".concat(collectionName, "-").concat(_dryCounter) }];
                    }
                    return [4 /*yield*/, (0, firestore_1.addDoc)((0, firestore_1.collection)(firebaseConfig_1.db, collectionName), data)];
                case 1:
                    docRef = _a.sent();
                    return [2 /*return*/, { id: docRef.id }];
            }
        });
    });
}
function importCsv() {
    return __awaiter(this, void 0, void 0, function () {
        var csvPath, raw, lines, header, i, row, cols, obj, j, checkInDateRaw, checkOutDateRaw, roomNumberRaw, name_1, phone, guestCount, totalPrice, payment_qr, payment_cash, guestDoc, reservationData, reservationDoc, roomParts, rr, _i, roomParts_1, rn, rr, p, p, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 15, , 16]);
                    console.log('📥 Reading CSV');
                    csvPath = path.join(process.cwd(), 'import', 'day1.csv');
                    raw = (0, fs_1.readFileSync)(csvPath, 'utf8');
                    lines = raw.split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
                    if (lines.length < 2) {
                        console.log('No rows to import');
                        return [2 /*return*/];
                    }
                    header = lines[0].split(',').map(function (h) { return h.trim(); });
                    console.log("Found ".concat(lines.length - 1, " data row(s)"));
                    i = 1;
                    _b.label = 1;
                case 1:
                    if (!(i < lines.length)) return [3 /*break*/, 14];
                    row = lines[i];
                    cols = row.split(',').map(function (c) { return c.trim(); });
                    obj = {};
                    for (j = 0; j < header.length; j++) {
                        obj[header[j]] = (_a = cols[j]) !== null && _a !== void 0 ? _a : '';
                    }
                    checkInDateRaw = obj['checkInDate'];
                    checkOutDateRaw = obj['checkOutDate'];
                    roomNumberRaw = obj['roomNumber'];
                    name_1 = obj['name'];
                    phone = obj['phone'];
                    guestCount = toNumber(obj['guestCount']);
                    totalPrice = toNumber(obj['totalPrice']);
                    payment_qr = toNumber(obj['paymentmethod_qr']);
                    payment_cash = toNumber(obj['paymentmethod_cash']);
                    return [4 /*yield*/, maybeAdd('guest', {
                            name: name_1 || null,
                            phone: phone || null,
                            createdAt: (0, firestore_1.serverTimestamp)(),
                            importedFrom: 'day1.csv',
                        })];
                case 2:
                    guestDoc = _b.sent();
                    console.log("  \u27A4 Created guest (".concat(guestDoc.id, ") - ").concat(name_1));
                    reservationData = {
                        guestId: guestDoc.id,
                        guestName: name_1 || null,
                        guestPhone: phone || null,
                        guestCount: guestCount,
                        totalPrice: totalPrice,
                        status: 'checked_out',
                        checkInDate: checkInDateRaw ? new Date(checkInDateRaw).toISOString() : null,
                        checkOutDate: checkOutDateRaw ? new Date(checkOutDateRaw).toISOString() : null,
                        createdAt: (0, firestore_1.serverTimestamp)(),
                        importedFrom: 'day1.csv',
                    };
                    return [4 /*yield*/, maybeAdd('reservations', reservationData)];
                case 3:
                    reservationDoc = _b.sent();
                    console.log("  \u27A4 Created reservation (".concat(reservationDoc.id, ") for guest ").concat(name_1));
                    roomParts = roomNumberRaw ? roomNumberRaw.split('-').map(function (r) { return r.trim(); }).filter(Boolean) : [];
                    if (!(roomParts.length === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, maybeAdd('reservationRooms', {
                            reservationId: reservationDoc.id,
                            roomNumber: null,
                            createdAt: (0, firestore_1.serverTimestamp)(),
                            importedFrom: 'day1.csv',
                        })];
                case 4:
                    rr = _b.sent();
                    console.log("    \u26A0\uFE0F No room number found; created placeholder reservationRoom (".concat(rr.id, ")"));
                    return [3 /*break*/, 9];
                case 5:
                    _i = 0, roomParts_1 = roomParts;
                    _b.label = 6;
                case 6:
                    if (!(_i < roomParts_1.length)) return [3 /*break*/, 9];
                    rn = roomParts_1[_i];
                    return [4 /*yield*/, maybeAdd('reservationRooms', {
                            reservationId: reservationDoc.id,
                            roomNumber: rn,
                            createdAt: (0, firestore_1.serverTimestamp)(),
                            importedFrom: 'day1.csv',
                        })];
                case 7:
                    rr = _b.sent();
                    console.log("    \u27A4 reservationRoom created for room ".concat(rn, " (").concat(rr.id, ")"));
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    if (!(payment_qr > 0)) return [3 /*break*/, 11];
                    return [4 /*yield*/, maybeAdd('payments', {
                            reservationId: reservationDoc.id,
                            amount: payment_qr,
                            paymentMethod: 'Basha',
                            createdAt: (0, firestore_1.serverTimestamp)(),
                            importedFrom: 'day1.csv',
                        })];
                case 10:
                    p = _b.sent();
                    console.log("    \u27A4 Payment recorded: Basha ".concat(payment_qr, " (").concat(p.id, ")"));
                    _b.label = 11;
                case 11:
                    if (!(payment_cash > 0)) return [3 /*break*/, 13];
                    return [4 /*yield*/, maybeAdd('payments', {
                            reservationId: reservationDoc.id,
                            amount: payment_cash,
                            paymentMethod: 'Cash',
                            createdAt: (0, firestore_1.serverTimestamp)(),
                            importedFrom: 'day1.csv',
                        })];
                case 12:
                    p = _b.sent();
                    console.log("    \u27A4 Payment recorded: Cash ".concat(payment_cash, " (").concat(p.id, ")"));
                    _b.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 1];
                case 14:
                    console.log('\n🎉 Import finished');
                    return [3 /*break*/, 16];
                case 15:
                    error_1 = _b.sent();
                    console.error('❌ Import failed', error_1);
                    process.exit(1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Run when executed
importCsv();
