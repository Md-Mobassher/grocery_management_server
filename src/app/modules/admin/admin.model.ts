import { Schema, model } from 'mongoose'
import { BloodGroup, Gender } from './admin.constant'
import { AdminModel, TAdmin, TUserName } from './admin.interface'

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First Name is required'],
    trim: true,
    maxlength: [30, 'Name can not be more than 30 characters'],
  },

  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last Name is required'],
    maxlength: [30, 'Name can not be more than 30 characters'],
  },
})

const adminSchema = new Schema<TAdmin, AdminModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      unique: true,
      ref: 'User',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    name: {
      type: userNameSchema,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    gender: {
      type: String,
      enum: {
        values: Gender,
        message: '{VALUE} is not a valid gender',
      },
      required: [true, 'Gender is required'],
    },
    dateOfBirth: { type: Date },
    contactNo: { type: String, required: [true, 'Contact number is required'] },
    emergencyContactNo: {
      type: String,
      required: [true, 'Emergency contact number is required'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BloodGroup,
        message: '{VALUE} is not a valid blood group',
      },
    },
    presentAddress: {
      type: String,
      required: [true, 'Present address is required'],
    },
    permanentAddress: {
      type: String,
      required: [true, 'Permanent address is required'],
    },
    profileImg: { type: String, default: '' },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
)

// generating full name
adminSchema.virtual('fullName').get(function () {
  return this?.name?.firstName + ' ' + this?.name?.lastName
})

// filter out deleted documents
adminSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

adminSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

adminSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } })
  next()
})

//checking if user is already exist!
adminSchema.statics.isAdminExistsByEmail = async function (email: string) {
  const existingUser = await Admin.findOne({ email })
  return existingUser
}
adminSchema.statics.isAdminExistsById = async function (id: string) {
  const existingUser = await Admin.findById({ id })
  return existingUser
}

export const Admin = model<TAdmin, AdminModel>('Admin', adminSchema)
