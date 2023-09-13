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
},
{ timestamps: true });

const scans = new mongoose.Schema(
  {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const branch = new mongoose.Schema(
  {
    ref: { type: String, required: true },
    scans: [scans]
  },
  { timestamps: true }
);

const repository = new mongoose.Schema(
  {
    name: { type: String, required: true },
    branches: [branch]
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
    description: { type: String, required: true },
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

const stats = new mongoose.Schema({
  repository: { type: String, required: true },
  providers: [
    { name: { type: String } },
    { critical: { type: Number } },
    { high: { type: Number } },
    { medium: { type: Number } },
    { low: { type: Number } },
    { negligible: { type: Number } },
  ]
  }, 
  { timestamps: true }
);

module.exports = {
  repository: mongoose.model("Repositories", repository),
  findings: mongoose.model("Findings", finding),
  user: mongoose.model("User", user),
  settings: mongoose.model("Settings", settings),
  token: mongoose.model("Token", token),
  parser: mongoose.model("Parser", parser),
  stats: mongoose.model("Stats", stats),
};
