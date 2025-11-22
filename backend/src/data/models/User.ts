import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  kuEmail: string;
  password: string;
  role: string | "buyer" | "seller" | "admin";
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  sellerRequestDate?: Date;
  sellerApprovalDate?: Date;
  sellerRejectionReason?: string;
  faculty?: string;
  contact?: string;
  isVerified?: boolean;
  verificationDate?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  profilePicture?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  kuEmail: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (this: IUser, email: string) {
        // Admin must use @ku.ac.th, others use @ku.th
        if (this.role === "admin") {
          return /.+@ku\.ac\.th$/.test(email);
        }
        return /.+@ku\.th$/.test(email);
      },
      message: function (props: { value: string; path: string; role?: string }) {
        const role = props.role || "user";
        if (role === "admin") {
          return "Admin email must be @ku.ac.th";
        }
        return "Email must be @ku.th";
      },
    },
  },
  password: { type: String, required: true },
  role: { type: String, default: "buyer" },
  sellerStatus: { type: String, default: undefined },
  sellerRequestDate: { type: Date },
  sellerApprovalDate: { type: Date },
  sellerRejectionReason: { type: String },
  faculty: { type: String, required: true},
  contact: { type: String, required: true, unique: true, match: /^0\d{9}$/},
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpires: { type: Date },
  profilePicture: { type: String }
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
