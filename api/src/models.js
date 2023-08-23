const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const finding = new mongoose.Schema({
  branchId :  { type: ObjectId },
  provider: { type: String },
  ruleId: { type: String },
  url: { type: [String] },
  title: { type: String },
  message: { type: String },
  impact: { type: String },
  resource: { type: String },
  severity: { type: String },
  file: { type: String },
  line: { type: [String] },
  package: { type: String },
  version: { type: String },
  resolution: { type: String },
  details: { type: String },
  cve: { type: String },
});

const branch = new mongoose.Schema(
  {
    repository: { type: String, required: true },
    ref: { type: String, required: true }
  },
  { timestamps: true }
);

const user = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const settings = new mongoose.Schema({
  default: { type: Boolean, default: true },
  sso: {
    type: {
      enabled: { type: Boolean, default: false },
      entryPoint: { type: String, required: false },
      issuer: { type: String, required: false },
      certificate: { type: String, required: false },
      adminGroup: { type: String, required: false },
    },
    required: true,
  },
});

const token = new mongoose.Schema(
  {
    token: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const parser = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    rootPath: { type: String },
    unwind: { type: String },
    fields: {
      provider: { type: String },
      ruleId: { type: String },
      url: { type: String },
      title: { type: String },
      message: { type: String },
      impact: { type: String },
      resource: { type: String },
      severity: { type: String },
      file: { type: String },
      line: { type: String },
      package: { type: String },
      version: { type: String },
      resolution: { type: String },
      details: { type: String },
      cve: { type: String },
    },
    severities: {
      critical: { type: mongoose.Schema.Types.Mixed },
      high: { type: mongoose.Schema.Types.Mixed },
      medium: { type: mongoose.Schema.Types.Mixed },
      low: { type: mongoose.Schema.Types.Mixed },
      negligible: { type: mongoose.Schema.Types.Mixed },
    }
  },
  { timestamps: true }
);

module.exports = {
  branch: mongoose.model("Branch", branch),
  findings: mongoose.model("Findings", finding),
  user: mongoose.model("User", user),
  settings: mongoose.model("Settings", settings),
  token: mongoose.model("Token", token),
  parser: mongoose.model("Parser", parser),
};
