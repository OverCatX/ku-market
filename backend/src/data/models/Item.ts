import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document{
    owner: mongoose.Types.ObjectId;
    title : string,
    description : string,
    category: string,
    price: number,
    status : "available" | "reserved" | "sold",
    approvalStatus: "pending" | "approved" | "rejected",
    rejectionReason?: string,
    photo: string[],
    createAt: Date,
    updateAt: Date
}

const itemSchema: Schema<IItem> = new Schema(
    {
        owner: {type: Schema.Types.ObjectId, ref : "User", require : true, index : true},
        title: {type: String , require: true, trim : true, maxlength: 100},
        description: {type: String, maxlength: 4000},
        category: {type: String, require: true, index: true},
        price : {type: Number, require: true, min: 0},
        status: {
            type: String,
            enum: ["available", "reserved", "sold"],
            default: "available",
            index : true
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        rejectionReason: {
            type: String,
            maxlength: 500,
        },
        photo: {type: [String], default: []},
    },
    { timestamps: true}
);

// Text search index for full-text search
itemSchema.index({ title: "text", description: "text" });

// Compound indexes for better query performance
itemSchema.index({ approvalStatus: 1, status: 1, updateAt: -1 }); // For newest updated filter
itemSchema.index({ approvalStatus: 1, status: 1, createAt: -1 }); // For newest created
itemSchema.index({ approvalStatus: 1, category: 1, status: 1 }); // For category filter
itemSchema.index({ approvalStatus: 1, status: 1, price: 1 }); // For price sorting
itemSchema.index({ updateAt: -1 }); // For updateAt sorting performance
itemSchema.index({ createAt: -1 }); // For createAt sorting performance

export default mongoose.model<IItem>("Item", itemSchema);