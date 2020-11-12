var _ = require('lodash');
const short = require('short-uuid');
const csv=require('csvtojson')

let shiftFileAndRename = function (tracefile) {
    return new Promise((resolve, reject) => {
        tracefile.mv('/tmp/trace', (err)=> {
            if (err)
                return reject(err);
                
            return resolve("File uploaded !!");
        }) 
    });
}

function getObjFromRedis() {
    redis = global.redisClient;
    return new Promise((resolve, reject)=> {
       redis.hgetall("qmine", (err, obj) => {
          if (err) 
            return reject(err);
            
          return resolve(obj);
       });
    });
}

async function invokeMine(req) {
    
    var tracefile = req.files;
    
    var reqObj = req.query;
    var pattern = reqObj.pattern;
    var event_length = reqObj.event_length;
    var input_file_path = tracefile.input_file.tempFilePath;//"/tmp/trace";
    var status = 1;
 
    redis = global.redisClient;
    var requestObj = {
        "requestId": "req_" + short.generate(),
        "pattern": pattern,
        "event_length": event_length,
        "input_file_path" : input_file_path,
        "output_file_path" : "/tmp/",
        "status": 1
    };
    
    await redis.hmset("qmine", requestObj);
    
    return {'requestId' : requestObj.requestId};
}

async function getStatus(requestId) {
    redis = global.redisClient;
    
    try {
        var result = await getObjFromRedis();
        
        if (result == null) {
            throw new Error("No request found");
        }
        
        return {'status' : result.status};
    } catch (err) {
        console.error(err.message);
        return {'status' : '3',
                'message': 'Something went wrong internally in the server or mining framework'};
    }
}

function customJSONParser(resultObj) {
    var parsedObj = [];
    for (var i = 0; i <resultObj.length; i++) {
        if (i == 0) { // skip header
            continue;
        } else {
            let _obj = resultObj[i];
            if (_.values(_obj)[0].length > 0) {
                let _key = _.values(_obj)[0];
                var items = {};
                items[_key] = [];
                parsedObj.push(items);
            } else {
                let _lastObj = parsedObj[parsedObj.length - 1];
                let _key_prime = _.keys(_lastObj)[0];
                let _value_prime = _.values(_lastObj)[0];
                _value_prime.push(_.remove(_.values(_obj), (n)=> { return n != ""}));
                _lastObj[_key_prime] = _value_prime;
                parsedObj[parsedObj.length - 1] = _lastObj;
            }
        }
    }
    
    return parsedObj;
}

function changeToPatternMatch(resultObj) {
    var obj = {
        "count":0,
        "match":[]
    };
    
    obj.count = _.size(resultObj);
    for (var i=0; i<_.size(resultObj);i++) {
        
        let _pattern = _.keys(resultObj[i])[0];
        let _value = _.values(resultObj[i])[0];
        // _value = _.pullAll(_value, _.size(_value)-1); // remove the last Quant. Ideally, this should not be present. Must be fixed in C-engine accordingly.
        
        var _obj = {
            "pattern" : _pattern,
            "value": _value
        }
        obj.match.push(_obj);
    }
    
    return obj;
}

async function getResult(requestId) {
    redis = global.redisClient;
    var result = await getObjFromRedis();
        
    if (result == null) {
        throw new Error("No request found");
    }
    
    if (result.status == "1") {
        return {'status' : result.status};
    } else if (result.status == "3") {
        return {'status' : result.status, "message": "Something went wrong internally in the mining framework"};
    }
    
    resultJSON = await csv({
        noheader: true
    }).fromFile(result.output_file_path);
    
    var _resultJSONParsed = customJSONParser(resultJSON);
    var resultJSONParsed = changeToPatternMatch(_resultJSONParsed);
    
    console.log(resultJSONParsed);
    return resultJSONParsed;
}

module.exports = {
    // 'invokeMine' : abc,
    'invokeMine' : invokeMine,
    'status' : getStatus,
    'result' : getResult
};
