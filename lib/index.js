var child_process = require('child_process');
var csv = require('csv');


module.exports.list = function (callback) {
    if (process.platform != 'win32') {
        return callback(new Error('Not supported platform.'), null);
    }


    var command = 'tasklist /FO csv /NH';

    child_process.exec(command, function (err, stdout, stderr) {
        if (err) {
            return callback(err, null);
        }

        csv.parse(stdout, function(err, data) {
            if (err) {
                return callback(err, null);
            }


            var results = data.map(function(row) {
                return {
                    command: row[0],
                    pid: parseInt(row[1]),
                    sessionName: row[2],
                    sessionNumber: parseInt(row[3]),
                    mem: row[4].replace(',', '').replace('.', '').replace('K', '').replace(' ', '')
                }
            });

            callback(null, results);
        });
    });
};


module.exports.kill = function (pid, force, callback) {
    if (process.platform != 'win32') {
        return callback(new Error('Not supported platform.'), null);
    }

    if (typeof(force) == 'function') {
        callback = force;
        force = true;
    }

    var f = (force) ? '/F' : '';

    var command = ('taskkill {0} /PID {1}')
        .replace('{0}', f)
        .replace('{1}', pid);

    child_process.exec(command, function (err, stdout, stderr) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};


module.exports.findByName = function(processName, callback) {
    if (process.platform != 'win32') {
        return callback(new Error('Not supported platform.'), null);
    }

    this.list(function(err, list) {
        if (err) {
            return callback(err, null);
        }

        var result = list.filter(function(process) {
            return (process.command.toLowerCase() === processName.toLowerCase());
        });

        if (result.length == 0) {
            return callback(new Error('Process not found.'));
        }

        callback(null, result);
    });
};
