import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document{
    owner: mongoose.Types.ObjectId;
    title : string,
    description : string,
    category: string,
    price: number,
    status : "available" | "reserved" | "sold",
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
        photo: {type: [String], default: []},
    },
    { timestamps: true}
);

itemSchema.index({ title: "text", description: "text" });
export default mongoose.model<IItem>("Item", itemSchema);