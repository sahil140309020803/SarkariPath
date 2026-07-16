import mongoose from "mongoose";
import { usersDbConnection } from "../config/mongo_config.js";

const VisitorSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    firstVisit: {
        type: Date,
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    visits: [
        {
            date: {
                type: String,
                required: true
            },
            count: {
                type: Number,
                default: 1
            }
        }
    ],
    device: String,
    browser: String
}, {
    timestamps: true,
    collection: 'visitors'
});

const SessionSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },
    sessionStart: {
        type: Date,
        default: Date.now
    },
    sessionEnd: Date,
    lastSeen: {
        type: Date,
        default: Date.now
    },
    durationInSeconds: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    collection: 'sessions'
});

export const VisitorModel = usersDbConnection.models.Visitor || usersDbConnection.model('Visitor', VisitorSchema);
export const SessionModel = usersDbConnection.models.Session || usersDbConnection.model('Session', SessionSchema);

