const zlib = require("zlib");

function parse(parser, data, removePaths) {
    try {
        let results = data;
        if (parser.rootPath?.length) {
            results = parser.rootPath.includes(".") ?
                parser.rootPath.split('.').reduce((o, key) => o?.[key] || null, data) :
                data[parser.rootPath];
        }

        parser.severities = {
            critical: String(parser.severities?.critical),
            high: String(parser.severities?.high),
            medium: String(parser.severities?.medium),
            low: String(parser.severities?.low),
            negligible: String(parser.severities?.negligible)
        };

        const parserKeys = Object.keys(parser.fields);
        
        const output = [];
        for (const result of results) {
            const unwound = parser.unwind ? result[parser.unwind] : [result];
            for (const item of unwound) {
                for (let parentKey of Object.keys(result)) {
                    if (parentKey !== parser.unwind) {
                        item[parentKey] = result[parentKey];
                    }
                }
                const newResult = {};
                for (const key of parserKeys) {
                    // FIXED VALUE
                    if (parser.fields[key]?.length && parser.fields[key].includes('"')) {
                        newResult[key] = parser.fields[key].replace('"', "").replace('"', "");
                    } else {
                        // NESTED VALUE
                        if (parser.fields[key]?.length && parser.fields[key].includes(".")) {
                            newResult[key] = parser.fields[key].split('.').reduce((o, key) => (o && o[key] ? o[key] : null), item);
                        } else {
                            if (item[parser.fields[key]]) {
                                newResult[key] = item[parser.fields[key]];
                            }
                        }
                    }
                }

                newResult['provider'] = parser.name;

                switch (String(newResult['severity'])) {
                    case parser.severities?.critical:
                        newResult['severity'] = 'CRITICAL';
                        break;
                    case parser.severities?.medium:
                        newResult['severity'] = 'MEDIUM';
                        break;
                    case parser.severities?.low:
                        newResult['severity'] = 'LOW';
                        break;
                    case parser.severities?.negligible:
                        newResult['severity'] = 'NEGLIGIBLE';
                        break;
                    default:
                        newResult['severity'] = 'HIGH';
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

                    newResult['file'] = newResult['file'].replace(/__slash__/g, "/");
                    newResult['file'] = newResult['file'].replace(":latest", "");
                }

                newResult['details'] = zlib.gzipSync(JSON.stringify(item)).toString("base64");
                output.push(newResult);
            }
        }

        return output;
    } catch (error) {
        console.log(error);
        console.log(parser);
        return false;
    }
}

module.exports = parse;
