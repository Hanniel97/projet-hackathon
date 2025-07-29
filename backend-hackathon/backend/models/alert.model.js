import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    consultation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
        required: true
    },
    type: {
        type: String,
        enum: ['critical', 'warning', 'info'],
        required: true
    },
    category: {
        type: String,
        enum: ['laboratory', 'clinical', 'medication', 'appointment'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    value: {
        current: mongoose.Schema.Types.Mixed,
        normal: String,
        unit: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    }
}, {
    timestamps: true
});

alertSchema.index({ patient: 1, createdAt: -1 });
alertSchema.index({ type: 1, isRead: 1 });

alertSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

alertSchema.set('toJSON', {
    virtuals: true
});

export const Alert = mongoose.model("Alert", alertSchema);