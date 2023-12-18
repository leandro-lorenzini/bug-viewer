const models = require("./models");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

function branchStats(repositoryId, branchId) {
  return new Promise((resolve, reject) => {

    models.repository.findOne({ _id: repositoryId }).then(repository => {
      if (!repository) {
        return resolve();
      }

      // If no branch is informed, then return stats for master or main branch.
      if (!branchId) {
        let protectedBranches = repository.branches?.filter(
          b => {
            if (repository.head) {
              return b.ref === repository.head || b.ref.includes(`/${repository.head}`);
            } else {
              return ["main", "master"].includes(b.ref) || b.ref.includes('/main') || b.ref.includes('/master')
            }
          }
        );
        if (protectedBranches?.length) {
          branchId = protectedBranches[0]._id;
        }
      }

      if (!branchId) {
        resolve();
      }

      const pipeline = [
        { $match: { branchId: new ObjectId(branchId) } },
        {
          $group: {
            _id: '$provider',
            high: { $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] } },
            low: { $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] } },
            critical: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } },
            negligible: { $sum: { $cond: [{ $eq: ['$severity', 'NEGLIGIBLE'] }, 1, 0] } },
            updatedAt: { $first: '$updatedAt' }
          }
        },
        {
          $project: {
            name: '$_id',
            high: 1,
            medium: 1,
            low: 1,
            critical: 1,
            negligible: 1,
            updatedAt: 1,
            _id: 0
          }
        }
      ];

      models.findings.aggregate(pipeline).then(docs => {
        if (docs.length) {
          resolve(docs);
        } else {
          resolve(null);
        }
      }).catch(error => {
        reject(error);
      });

    }).catch(error => {
      reject(error);
    });

  });
}

function repository(_id) {
  return new Promise((resolve, reject) => {
    models.repository.findOne({ _id }).then(doc => {
      resolve(doc);
    }).catch(error => {
      reject(error);
    });
  });
}

function repositories(name, skip) {
  return new Promise((resolve, reject) => {

    const filter = name ? {
      name: {
        $regex: name,
        $options: "i",
      }
    } : {};

    Promise.all([
      models.repository.find(filter).skip(skip).limit(10),
      models.repository.find(filter),
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

function branches(repositoryId, ref, skip) {
  return new Promise((resolve, reject) => {
    var pipeline = [
      { $match: { _id: new ObjectId(repositoryId) } },
      { $unwind: "$branches" },
      { $replaceRoot: { newRoot: "$branches" } },
    ];

    if (ref?.length) {
      pipeline.push({
        $match: {
          ref: {
            $regex: ref,
            $options: "i",
          }
        }
      });
    }

    Promise.all([
      models.repository.aggregate(pipeline.concat({ $sort: { name: 1 } }, { $skip: skip }, { $limit: 10 })),
      models.repository.aggregate(pipeline),
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

function branch(repositoryId, branchId) {
  return new Promise((resolve, reject) => {
    var pipeline = [
      { $match: { _id: new ObjectId(repositoryId) } },
      { $unwind: "$branches" },
      { $match: { "branches._id": new ObjectId(branchId) } },
      {
        $lookup: {
          from: 'findings',
          localField: 'branches._id',
          foreignField: 'branchId',
          as: 'branches.findings'
        }
      },
      { $unwind: { path: "$branches.findings", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$branches.findings.provider",
          high: { $sum: { $cond: [{ $eq: ["$branches.findings.severity", 'HIGH'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ["$branches.findings.severity", 'MEDIUM'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ["$branches.findings.severity", 'LOW'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ["$branches.findings.severity", 'CRITICAL'] }, 1, 0] } },
          negligible: { $sum: { $cond: [{ $eq: ["$branches.findings.severity", 'NEGLIGIBLE'] }, 1, 0] } },
          ref: { $first: "$branches.ref" },
          root_id: { $first: "$branches._id" },
          scans: { $first: "$branches.scans" }
        }
      },
      {
        $group: {
          _id: "$root_id",
          ref: { $first: "$ref" },
          scans: { $first: "$scans"},
          findings: {
            $push: {
              provider: "$_id",
              high: "$high",
              medium: "$medium",
              low: "$low",
              critical: "$critical",
              negligible: "$negligible"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          ref: 1,
          scans: 1,
          findings: 1
        }
      }
    ];
    

    models.repository.aggregate(pipeline).then(docs => {
      resolve(docs[0])
    }).catch(error => {
      reject(error);
    });
  });
}

function upsert(repository, head, ref, findings, first) {
  return new Promise((resolve, reject) => {

    var scan = {
      critical: findings.filter(f => f.severity === 'CRITICAL' ).length, 
      high: findings.filter(f => f.severity === 'HIGH' ).length, 
      medium: findings.filter(f => f.severity === 'MEDIUM' ).length, 
      low: findings.filter(f => f.severity === 'LOW' ).length 
    };
    
    addRepository(repository, head).then(async (repository) => {
      // Find branch Id
      let branchId = repository.branches.filter(b => b.ref === ref)?.[0]?._id;
      if (!branchId) {
        try {
          branchId = await addBranch(repository._id, ref);
        } catch (error) {
          return reject(error);
        }
      }

      try {
        if (first) {
          await models.findings.deleteMany({ branchId });
        }
        await models.findings.insertMany(findings.map(f => {
          f.branchId = branchId;
          return f;
        }));

        resolve({ repository, branchId: branchId, scan: scan });
      } catch (error) {
        reject(error);
      }

    }).catch(error => {
      reject(error);
    })
  });
}

async function addScan(repositoryId, branchId, scan) {
  return models.repository.updateOne(
    { _id: repositoryId, 'branches._id': branchId }, 
    { $addToSet: { 'branches.$.scans': scan } }
  );
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
      { $limit: 10 }
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

function removeBranch(repositoryId, branchId) {
  return new Promise((resolve, reject) => {
    models.repository
      .updateOne({ _id: repositoryId }, { $pull: { branches: { _id: branchId } } })
      .then(async () => {
        models.findings.deleteMany({ branchId });
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function addRepository(name, head) {
  return new Promise((resolve, reject) => {
    models.repository.findOne({ name }).then(async doc => {
      if (doc) {
        await models.repository.updateOne({ name }, { head });
        resolve(doc);
      } else {
        let repository = new models.repository({ name, head });
        repository.save().then((doc) => {
          resolve(doc);
        }).catch(error => {
          reject(error);
        })
      }
    }).catch(error => {
      reject(error);
    })
  })
}

function addBranch(repositoryId, ref) {
  return new Promise((resolve, reject) => {
    let branch = { ref, _id: new ObjectId() };
    models.repository.updateOne(
      { _id: repositoryId },
      { $addToSet: { branches: branch } }
    ).then((result) => {
      if (result.modifiedCount) {
        resolve(branch._id);
      } else {
        reject();
      }
    }).catch(error => {
      reject(error);
    })
  });
}

module.exports = {
  upsert,
  findings,
  repositories,
  branches,
  branch,
  removeRepository,
  removeBranch,
  branchStats,
  repository,
  addScan
};
