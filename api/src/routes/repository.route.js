const express = require("express");
const Joi = require("joi");
const multer = require("multer");
const zlib = require("zlib");
const controller = require("../controller");
const tokenController = require("../controllers/token.controller");
const parserController = require("../controllers/parser.controller");
const authenticated = require("../helper/authenticated.helper");
const parse = require("../helper/parser.helper");

const Router = express.Router();
const upload = multer();

function verifyToken(req, res, next) {
  const { error, value } = Joi.object({
    name: Joi.string().required(),
    ref: Joi.string().required(),
    token: Joi.string().required(),
    modifiedFiles: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string())),
    removePaths: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string()))
  }).validate(req.body);

  if (error) {
    return res.status(206).send(error.details[0].message);
  }

  tokenController
    .get(value.token)
    .then((result) => {
      if (result) {
        next();
      } else {
        res.status(403).send("Invalid token");
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
}

Router.post("/", [upload.array("files"), verifyToken], async (req, res) => {
  const { error, value } = Joi.object({
    name: Joi.string().required(),
    ref: Joi.string().required(),
    token: Joi.string().required(),
    modifiedFiles: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string())),
    removePaths: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string()))
  }).validate(req.body);

  if (error) {
    return res.status(206).send(error.details[0].message);
  }

  if (!req.files || !req.files.length) {
    return res.status(206).send("Json file is required");
  }

  // Printing the request body for debug purpose
  console.log(value);

  // Get parsers
  var allParsers = await parserController.all();
  var parsers = {}
  if (allParsers?.data?.length) {
    for (let parser of allParsers.data) {
      parsers[parser.name] = parser.toObject();
    }
  }

  // Read Json file
  let findings = [];
  for (let file of req.files) {
    let parserName = file.originalname.match(/__(.*?)__/)[1];
    if (parsers?.[parserName]) {

      let results = null;
      try {
        if(file.buffer.toString().length) {
          results = JSON.parse(file.buffer.toString());
        }
      } catch (error) {
        return res.status(206).send(`${file.originalname} seems to be corrupt`);
      }
      var removePaths = normalizeToArray(value.removePaths);
      
      // Specific for docker scanning file name
      removePaths.push(`${value.name}-latest`);

      findings = findings.concat(parse(parsers[parserName], results || [], removePaths))

    } else {
      return res.status(206).send('Could not find a parser for the uploaded file ' + file.originalname);
    }
  }

  // Remove findings for unchaged files
  if (value.modifiedFiles?.length) {
    findings = findings.filter((finding) => {
      return normalizeToArray(value.modifiedFiles)
        .map(f => (f.toLowerCase()))
        .includes(finding.file.toLowerCase());
    });
  }

  // Upsert repository and scan
  try {
    let upsertResult = await controller.upsert(value.name, value.ref, findings || []);
    if (findings?.length) {
      for (let finding of findings) {
        if (["CRITICAL", "HIGH"].includes(finding.severity)) {
          return res
            .status(207)
            .send(
              "Scan results have been saved, one or more serious bug has been found! " +
              `Go to ${req.protocol}://${req.hostname}/repository/branch/${upsertResult.branchId}?ref=${value.ref.replace(/\//g, "%2F")}&repository=${upsertResult.repository._id}&repositoryName=${upsertResult.repository.name} for details.`
            );
        }
      }
    }
    res.send("Scan results have been saved, no serious bug has been found :)");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error upserting repository and scan instance");
  }
});

Router.get("/", authenticated, (req, res) => {
  const { error, value } = Joi.object({
    name: Joi.string().allow(''),
    page: Joi.number().allow(''),
  }).validate(req.query);

  if (error) {
    return res.status(400).json(error.details);
  }

  controller
    .repositories(
      value.name,
      value.page ? (value.page - 1) * 20 : 0
    )
    .then((result) => {
      // Get stats
      let promises = result.repositories.map(r => {
        return controller.branchStats(r._id);
      })

      Promise.all(promises).then(values => {
        
        let promises = result.repositories.map((r, index) => {
          return {
            _id: r._id,
            name: r.name,
            providers: values[index],
            updatedAt: values[index]?.[0].updatedAt
          };
        });

        Promise.all(promises).then(() => {
          console.log(promises)
          res.json({
            results: {
              data: promises,
              total: result.total,
            },
            page: {
              current: value.page || 1,
              all: Math.ceil(result.total / 20),
            },
          });
        });

      }).catch(error => {
        console.log(error);
        res.status(500).send();
      })
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.get("/branch", authenticated, (req, res) => {
  const { error, value } = Joi.object({
    repository: Joi.string().required(),
    ref: Joi.string().allow(''),
    page: Joi.number().allow(''),
  }).validate({...req.query, ...req.params});

  if (error) {
    return res.status(400).json(error.details);
  }

  controller
    .branches(
      value.repository,
      value.ref,
      value.page ? (value.page - 1) * 20 : 0
    )
    .then((result) => {
      // Get stats
      let promises = result.branches.map(b => {
        return controller.branchStats(value.repository, b._id);
      })

      Promise.all(promises).then(values => {
        let promises = result.branches.map((b, index) => {
          return {
            _id: b._id, 
            ref: b.ref, 
            updatedAt: values[index]?.[0].updatedAt,
            providers: values[index]
          };
        });

        Promise.all(promises).then(values => {
          console.log(values)
          res.json({
            results: {
              data: values,
              total: result.total,
            },
            page: {
              current: value.page || 1,
              all: Math.ceil(result.total / 20),
            },
          });
        });

      }).catch(error => {
        console.log(error);
        res.status(500).send();
      });

    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.get("/branch/:branchId", authenticated, (req, res) => {
  const { error, value } = Joi.object({
    branchId: Joi.string().required(),
    page: Joi.number().allow(''),
    providers: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string())),
    ruleIds: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string())),
    severities: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string())),
    files: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string()))
  }).validate({ ...req.params, ...req.query });

  if (error) {
    return res.status(400).json(error.details);
  }

  controller
    .findings(
      value.branchId,
      normalizeToArray(value.providers),
      normalizeToArray(value.ruleIds),
      normalizeToArray(value.severities),
      normalizeToArray(value.files),
      value.page ? (value.page - 1) * 20 : 0
    )
    .then((result) => {
      let findings = [];
      for (let finding of result.findings) {
        finding.details = finding.details
          ? zlib
              .gunzipSync(Buffer.from(finding.details, "base64"))
              .toString("utf-8")
          : null;
        findings.push(finding);
      }
      res.json({
        results: {
          data: findings,
          total: result.total,
        },
        attributes: result.properties,
        page: {
          current: value.page || 1,
          all: Math.ceil(result.total / 20),
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

function normalizeToArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || !value.length) return [];
  return [value];
}

Router.delete("/", authenticated, (req, res) => {
  const { error, value } = Joi.object({
    repository: Joi.string().required(),
  }).validate(req.query);

  if (error) {
    return res.status(400).json(error.details);
  }

  controller
    .removeRepository(value.repository)
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.delete("/:repositoryId/branch/:branchId", authenticated, (req, res) => {
  const { error, value } = Joi.object({
    repositoryId: Joi.string().required(),
    branchId: Joi.string().required(),
  }).validate(req.params);

  if (error) {
    return res.status(400).json(error.details);
  }
  controller
    .removeBranch(value.repositoryId, value.branchId)
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

module.exports = Router;
