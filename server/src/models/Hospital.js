const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    // Existing Fields
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },

    emergencyNumber: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sector: {
      type: String,
      enum: [
        "healthcare",
        "salon",
        "dining",
        "travel",
        "logistics",
        "other",
      ],
      default: "healthcare",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Business Registration Fields
    ownerName: {
      type: String,
      default: "",
    },

    businessEmail: {
      type: String,
      default: "",
    },

    businessType: {
      type: String,
      default: "",
    },

    registrationNumber: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    landmark: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    establishedYear: {
      type: String,
      default: "",
    },

    employees: {
      type: String,
      default: "",
    },

    languages: {
      type: [String],
      default: [],
    },

    services: {
      type: [String],
      default: [],
    },

    serviceMode: {
      type: [String],
      default: [],
    },

    averagePrice: {
      type: String,
      default: "",
    },

    gstRegistered: {
      type: Boolean,
      default: false,
    },

    paymentMethods: {
      type: [String],
      default: [],
    },

    slotDuration: {
      type: String,
      default: "",
    },

    bufferTime: {
      type: String,
      default: "",
    },

    workingDays: {
      type: [String],
      default: [],
    },

    openTime: {
      type: String,
      default: "",
    },

    closeTime: {
      type: String,
      default: "",
    },

    lunchBreak: {
      type: String,
      default: "",
    },

    appointmentRequired: {
      type: Boolean,
      default: true,
    },

    emergencySupport: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);