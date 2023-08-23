const zlib = require("zlib");

function parse(parser, data, removePaths) {
    try {
        var results = data;
        if (parser.rootPath?.length) {
            if (parser.rootPath.includes(".")) {
                results = parser.rootPath.split('.').reduce((o, key) => (o && o[key] ? o[key] : null), data)
            } else {
                results = data[parser.rootPath];
            }
        }
        
        
        // Unwinding array
        if (parser.unwind?.length) {
            let newResults = [];
            for (let result of results) {
                result = result[parser.unwind].map(item => {
                    for (let key of Object.keys(result)) {
                        if (key !== parser.unwind) {
                            item[key] = result[key];
                        }
                    }
                    return item;
                });
                newResults = newResults.concat(result)
            }
            results = newResults;
        }
        
        // Mapping result fields
        results = results.map((result) => {
            let newResult = {};
            for (let key of Object.keys(parser.fields)) {
                if (parser.fields[key]?.length && parser.fields[key].includes('"')) {
                    // Hardcoded value
                    newResult[key] = parser.fields[key].replace('"',"").replace('"',"");
                } else {
                    if (parser.fields[key]?.length && parser.fields[key].includes(".")) {
                        if (parser.fields[key][0] === "/") {
                            newResult[key] = parser.fields[key].replace("/", "").split('.').reduce((o, key) => (o && o[key] ? o[key] : null), data);    
                        } else {
                            newResult[key] = parser.fields[key].split('.').reduce((o, key) => (o && o[key] ? o[key] : null), result);
                        }
                    } else {
                        // Value under the root path
                        if(result[parser.fields[key]]) {
                            if (parser.fields[key][0] === "/") {
                                newResult[key] = data[parser.fields[key].replace("/","")];
                            } else {
                                newResult[key] = result[parser.fields[key]];
                            }
                        }
                    }
                }
            }
            newResult['provider'] = parser.name;
            
            switch(String(newResult['severity'])) {
                case String(parser.severities?.critical):
                    newResult['severity'] = 'CRITICAL'
                    break;
                case String(parser.severities?.medium):
                    newResult['severity'] = 'MEDIUM'
                    break;
                case String(parser.severities?.low):
                    newResult['severity'] = 'LOW'
                    break;
                case String(parser.severities?.negligible):
                    newResult['severity'] = 'NEGLIGIBLE'
                    break;
                default:
                    newResult['severity'] = 'HIGH'
            }

            if (newResult['file']) {
                if (removePaths.length) {
                    for (let path of removePaths) {
                        newResult['file'] = newResult['file'].replace(path, "");
                    }
                }
                if (newResult['file'][0] === "/") {
                    newResult['file'] = newResult['file'].substring(1);
                }
                
                // Specific for Docker image names
                newResult['file'] = newResult['file'].replace(/__slash__/g, "/");
                newResult['file'] = newResult['file'].replace(":latest", "");
            }

            newResult['details'] = zlib.gzipSync(JSON.stringify(result)).toString("base64");
            return newResult;
        })
        return results;
    } catch (error) {
        console.log(error);
        console.log(parser);
        return false;
    }
}

module.exports = parse;
