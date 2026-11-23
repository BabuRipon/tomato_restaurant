import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
    restaurantId: mongoose.Schema.Types.ObjectId,
    name: string,
    description: string,
    image?: string,
    price: number,
    isAvailable: boolean,
    createdAt: Date,
    updatedAt: Date
}

const schema = new Schema<IMenuItem>({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: true
    }
},{
    timestamps: true
});

const MenuItem = mongoose.model('MenuItem', schema);

export default MenuItem;
