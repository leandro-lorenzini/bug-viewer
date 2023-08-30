const models = require("./models");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

function mainBranch (repository, branchId) {
  return new Promise((resolve, reject) => {
    
    const match = !branchId ? {
      repository,
      $or: [
        { ref: { $regex: 'main' } },
        { ref: { $regex: 'master' } },
      ]
    } : {
      _id: new ObjectId(branchId)
    }

    const pipeline = [
      { $match: match },
      { $lookup: {
        from: 'findings',
        localField: '_id',
        foreignField: 'branchId',
        as: 'findingsData'
      }},
      { $unwind: { path: '$findingsData', preserveNullAndEmptyArrays: true }},
      { $group: {
        _id:        { repository: '$repository', provider: '$findingsData.provider' },
        high:       { $sum: { $cond: [{ $eq: ['$findingsData.severity', 'HIGH'] }, 1, 0] }},
        medium:     { $sum: { $cond: [{ $eq: ['$findingsData.severity', 'MEDIUM'] }, 1, 0] }},
        low:        { $sum: { $cond: [{ $eq: ['$findingsData.severity', 'LOW'] }, 1, 0] }},
        critical:   { $sum: { $cond: [{ $eq: ['$findingsData.severity', 'CRITICAL'] }, 1, 0] }},
        negligible: { $sum: { $cond: [{ $eq: ['$findingsData.severity', 'NEGLIGIBLE'] }, 1, 0] }}
      }},
      { $group: {
        _id: '$_id.repository',
        providers: { $push: { name: '$_id.provider', high: '$high', medium: '$medium', low: '$low', critical: '$critical', negligible: '$negligible' } }
      }},
      { $project: {
        _id: 0,
        repository: '$_id',
        providers: '$providers'
      }}
    ];
    models.branch.aggregate(pipeline).then(docs => {
      if (docs[0]?.providers?.[0]?.name) {
        resolve(docs[0]);
      } else {
        resolve(null);
      }
    }).catch(error => {
      reject(error);
    })
  });
}

function repositories(name, skip) {
  return new Promise((resolve, reject) => {
    let filter = !name
      ? null
      : {
          repository: {
            $regex: name,
            $options: "i",
          },
        };

    const pipeline = filter ? [{ $match: filter }] : [];
    pipeline.push(
      {
        $sort: { updatedAt: -1 }
      },
      { $group: {
        _id: '$repository',
        updatedAt: { $first: '$updatedAt' }
      }},
      { $project: {
        _id: 0,
        repository: '$_id',
        updatedAt: 1
      }},
      { $sort: { repository: 1 } },
      { $skip: skip || 0 },
      { $limit: 20 }
    );

    // You may modify the total pipeline as needed
    const pipelineTotal = filter ? [{ $match: filter }] : [];
    pipelineTotal.push(
      { $group: {
        _id: '$repository',
        updatedAt: { $first: '$updatedAt' }
      }},
      { $project: {
        _id: 0,
        repository: '$_id',
        updatedAt: 1
      }});
    

    Promise.all([
      models.branch.aggregate(pipeline),
      models.branch.aggregate(pipelineTotal),
    ])
      .then((values) => {
        resolve({
          repositories: values[0],
          total: values[1]?.length || 0,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function branches(repository, ref, skip) {
  return new Promise((resolve, reject) => {

    var filter = !ref.length ? 
      { repository } : 
      {
        repository,
        ref: {
          $regex: ref,
          $options: "i",
        }
      };

    Promise.all([
      models.branch.find(filter).skip(skip||0).limit(20),
      models.branch.find(filter),
    ])
      .then((values) => {
        resolve({
          branches: values[0],
          total: values[1].length,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function upsert(repository, ref, findings) {
  return new Promise((resolve, reject) => {
    models.branch.findOne({ repository, ref }).then(async (doc) => {

      if (doc) {
        console.log('Deleting current branch scan')
        await models.branch.deleteOne({ _id: doc._id });
        await models.findings.deleteMany({ branchId: doc._id });
      }

      let branch = new models.branch({
        repository,
        ref
      });

      branch.save()
        .then(async (doc) => {
          await models.findings.insertMany(findings.map(f => {
            f.branchId = doc._id;
            return f;
          }));
          resolve(doc._id);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
}

function findings(
  branchId,
  providers,
  ruleIds,
  severities,
  files,
  skip
) {
  return new Promise((resolve, reject) => {
    let matchConditions = {};

    if (providers.length) matchConditions["provider"] = { $in: providers };
    if (ruleIds.length) matchConditions["ruleId"] = { $in: ruleIds };
    if (severities.length) matchConditions["severity"] = { $in: severities };
    if (files.length) matchConditions["file"] = { $in: files };

    console.log(matchConditions);

    let aggregationFindings = [
      { $match: { branchId: new ObjectId(branchId) } },
    ];

    let aggregationTotal = [
      { $match: { branchId: new ObjectId(branchId) } },
    ];

    if (Object.keys(matchConditions).length > 0) {
      aggregationFindings.push({ $match: matchConditions });
      aggregationTotal.push({ $match: matchConditions });
    }

    aggregationFindings.push(
      { $sort: { severity: 1, _id: 1 } },
      { $skip: skip || 0 },
      { $limit: 20 }
    );

    aggregationTotal.push(
      { $group: { _id: null, count: { $sum: 1 } } },
      {
        $project: {
          total: "$count",
        },
      }
    );

    let aggregationProperties = [
      { $match: { branchId: new ObjectId(branchId) } },
      {
        $group: {
          _id: null,
          providers: { $addToSet: "$provider" },
          ruleIds: { $addToSet: "$ruleId" },
          files: { $addToSet: "$file" },
          severities: { $addToSet: "$severity" },
        },
      },
      {
        $project: {
          ruleIds: 1,
          files: 1,
          providers: 1,
          severities: 1,
          _id: 0,
        },
      },
    ];

    Promise.all([
      models.findings.aggregate(aggregationFindings),
      models.findings.aggregate(aggregationProperties),
      models.findings.aggregate(aggregationTotal),
    ])
      .then((values) => {
        resolve({
          findings: values[0],
          properties: values[1][0],
          total: values[2][0]?.total || 0,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function removeRepository(repository) {
  return new Promise((resolve, reject) => {
    models.branch
      .deleteMany({ repository })
      .then((result) => {
        if (result.deletedCount) {
          resolve();
        } else {
          reject();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function removeBranch(branchId) {
  return new Promise((resolve, reject) => {
    models.branch
      .deleteOne({ _id: branchId })
      .then(async (result) => {
        if (result.deletedCount) {
          await models.findings.deleteMany({ branchId });
          resolve();
        } else {
          reject();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  upsert,
  findings,
  repositories,
  branches,
  removeRepository,
  removeBranch,
  mainBranch
};
