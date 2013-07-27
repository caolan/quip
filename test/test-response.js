var quip = require('../lib/quip'),
    http = require('http'),
    fs = require('fs');


exports.status = function (test) {
    test.expect(4);
    var res = quip({});
    test.same(res.status(200), res);
    test.equals(res._quip_status, 200);
    test.same(res.status(404), res);
    test.equals(res._quip_status, 404);
    test.done();
};


var statusTest = function (code, name) {
    return function (test) {
        test.expect(7);

        var res = quip({});
        test.equal(res[name](), res);
        test.equal(res._quip_status, code);

        var res2 = quip({
            writeHead: function (c, headers) {
                test.equal(code, c);
                test.equal(headers['Content-Type'], 'text/html');
                test.equal(headers['Content-Length'], 7);
            },
            write: function (data) {
                test.equal(data, 'content');
            },
            end: function () {
                process.nextTick(test.done);
            }
        });
        test.equal(res2[name]('content'), null);
    };
};

// success codes
exports.ok = statusTest(200, 'ok');
exports.created = statusTest(201, 'created');
exports.accepted = statusTest(202, 'accepted'); // remove this ???

// client error code
exports.badRequest = statusTest(400, 'badRequest');
exports.forbidden = statusTest(403, 'forbidden');
exports.unauthorized = statusTest(401, 'unauthorized');
exports.notFound = statusTest(404, 'notFound');
exports.conflict = statusTest(409, 'conflict');
exports.gone = statusTest(410, 'gone');
exports.notAllowed = statusTest(405, 'notAllowed');

// server error codes
exports.error = statusTest(500, 'error');

var redirectionTest = function (code, name, body) {
    return function (test) {
        test.expect(5);
        var res = quip({
            writeHead: function (c, headers) {
                test.equal(code, c);
                test.equal(headers['Location'], 'loc');
                test.equal(headers['Content-Type'], 'text/html');
            },
            write: function (data) {
                test.equal(data, body);
            },
            end: function () {
                process.nextTick(test.done);
            }
        });
        test.equals(res[name]('loc'), null);
    };
};

// redirection codes
exports.moved = redirectionTest(301, 'moved',
    '<html>' +
        '<head><title>301 Moved Permanently</title></head>' +
        '<body><p>Moved Permanently: <a href="loc">loc</a></p></body>' +
    '</html>');
exports.redirect = redirectionTest(302, 'redirect',
    '<html>' +
        '<head><title>302 Found</title></head>' +
        '<body><p>Found: <a href="loc">loc</a></p></body>' +
    '</html>');
exports.found = redirectionTest(302, 'found',
    '<html>' +
        '<head><title>302 Found</title></head>' +
        '<body><p>Found: <a href="loc">loc</a></p></body>' +
    '</html>');

exports.notModified = function (test) {
    test.expect(8);
    var res = quip({});
    res.send = function (data) {
        test.equals(res._quip_status, 304);
        test.same(res._quip_headers, {});
        // 304 must not return body
        test.equals(data, null);
    };
    test.equals(res.notModified(), null);
    test.equals(res.notModified('content'), null);
    test.done();
};

var mimeTypeTest = function (type, name) {
    return function (test) {
        test.expect(6);

        var res = quip({});
        res.send = function(data){
            test.ok(true, 'send called');
            test.equals(res._quip_headers['Content-Type'], type);
            test.equals(data, 'content');
        };
        test.equals(res[name]('content'), null);

        var res2 = quip({});
        res2.send = function(data){
            test.ok(false, 'send should not be called');
        };
        test.equals(res2[name](), res2);
        test.equals(res2._quip_headers['Content-Type'], type);
        test.done();
    };
};

exports.text = mimeTypeTest('text/plain', 'plain');
exports.plain = mimeTypeTest('text/plain', 'text');
exports.html = mimeTypeTest('text/html', 'html');
exports.xhtml = mimeTypeTest('application/xhtml+xml', 'xhtml');
exports.css = mimeTypeTest('text/css', 'css');
exports.xml = mimeTypeTest('text/xml', 'xml');
exports.atom = mimeTypeTest('application/atom+xml', 'atom');
exports.rss = mimeTypeTest('application/rss+xml', 'rss');
exports.javascript = mimeTypeTest('text/javascript', 'javascript');
exports.json = mimeTypeTest('application/json', 'json');

exports.jsonp = function (test) {
    test.expect(7);
    var res = quip({});
    res.send = function (data) {
        test.equals(data, 'mycallback({"some":"data"});');
        test.equals(res._quip_status, 200);
        test.same(res._quip_headers, {'Content-Type':'text/javascript'});
    };
    var r = res.jsonp('mycallback', {'some':'data'});
    test.equals(r, null); //should not allow further chaining

    // status code should be overridden
    res.error().jsonp('mycallback', {'some':'data'});
    test.done();
};

exports.send = function (test) {
    test.expect(4);
    var res = quip({
        writeHead: function (code, headers) {
            test.same(headers, {
                headers: 'test',
                'Content-Type': 'text/html',
                'Content-Length': 4
            });
            test.equals(code, 404);
        },
        write: function (data) {
            test.equals(data, 'data');
        },
        end: function () {
            test.ok(true, 'end called');
        }
    });
    res._quip_headers = {headers: 'test'};
    res._quip_status = 404;
    res.send('data');
    test.done();
};

exports['send defaults'] = function (test) {
    test.expect(4);
    var res = quip({
        writeHead: function (code, headers) {
            test.same(headers, {
                'Content-Type': 'text/html',
                'Content-Length': 4
            });
            test.equals(code, 200);
        },
        write: function (data) {
            test.equal(data, 'test');
        },
        end: function () {
            test.ok(true, 'end called');
        }
    });
    res.send('test');
    test.done();
};

exports['send object literal as json'] = function (test) {
    test.expect(8);
    var res1 = quip({
        writeHead: function (code, headers) {
            test.equal(code, 200);
            test.equal(headers['Content-Type'], 'application/json');
        },
        write: function (data) {
            test.equals(data, '{"test":"object"}');
        },
        end: function () {
            test.ok(true, 'end called');
        }
    });
    res1.json({test:'object'});
    var res2 = quip({
        writeHead: function (code, headers) {
            test.equal(code, 200);
            test.equal(headers['Content-Type'], 'application/json');
        },
        write: function (data) {
            test.equals(data, '{"test":"object"}');
        },
        end: function () {
            test.ok(true, 'end called');
        }
    });
    res2.json().ok({test:'object'});
    test.done();
};

exports.headers = function (test) {
    test.expect(3);
    var res = quip({});
    test.equals(res.headers({some:'header',test:'test'}), res);
    test.same(res._quip_headers, {
        some:'header',
        test:'test'
    });
    res.headers({'Content-Type':'test'});
    test.same(res._quip_headers, {
        'Content-Type':'test',
        some:'header',
        test:'test'
    });
    test.done();
};

exports.middleware = function (test) {
    test.expect(3);
    var res = {test:'response'};
    quip(null, res, function () {
        test.ok(res.json);
        test.ok(res.jsonp);
        test.ok(true, 'next called');
    });
    test.done();
};

exports['default mime type is json when obj as data'] = function (test) {
    test.expect(2);
    var res = quip({
        writeHead: function (code, headers) {
            test.same(headers, {
                'Content-Type': 'application/json',
                'Content-Length': 13
            });
        },
        write: function (data) {
            test.equals(data, JSON.stringify({foo: 'bar'}));
        },
        end: function () {
            test.done();
        }
    });
    res.ok({foo: 'bar'});
};

exports['default mime type is html for strings'] = function (test) {
    test.expect(2);
    var res = quip({
        writeHead: function (code, headers) {
            test.same(headers, {
                'Content-Type': 'text/html',
                'Content-Length': 7
            });
        },
        write: function (data) {
            test.equals(data, 'content');
        },
        end: function () {
            test.done();
        }
    });
    res.ok('content');
};

exports['default mime type is html for Buffers'] = function (test) {
    test.expect(2);
    var res = quip({
        writeHead: function (code, headers) {
            test.same(headers, {
                'Content-Type': 'text/html',
                'Content-Length': 7
            });
        },
        write: function (data) {
            test.equals(data.toString(), 'content');
        },
        end: function () {
            test.done();
        }
    });
    res.ok(new Buffer('content'));
};

exports['pipe data to extended response object'] = function (test) {
    test.expect(3);
    var filename = __dirname + '/../package.json';
    var server = http.createServer(function (req, res) {
        var read = fs.createReadStream(filename);
        read.pipe(quip(res).unauthorized().json());
    });
    server.listen(8888);
    http.get('http://127.0.0.1:8888', function (res) {
        test.equal(res.statusCode, 401);
        test.equal(res.headers['content-type'], 'application/json');
        var buffer = '';
        res.on('data', function (chunk) {
            buffer += chunk.toString();
        });
        res.on('error', test.done);
        res.on('end', function () {
            test.equal(buffer, fs.readFileSync(filename).toString());
            server.close(test.done);
        });
    });
};

exports['custom mime types'] = function (test) {
    test.expect(10);
    var type = 'application/x-whatever';

    var res = quip({});
    res.send = function(data){
        test.ok(true, 'send called');
        test.equals(res._quip_headers['Content-Type'], type);
        test.equals(data, 'content');
    };
    test.equals(res.mime(type).ok('content'), null);

    var res2 = quip({});
    res2.send = function(data){
        test.ok(true, 'send called');
        test.equals(res2._quip_headers['Content-Type'], type);
        test.equals(data, 'content');
    };
    test.equals(res2.mime(type, 'content'), null);

    var res3 = quip({});
    res3.send = function(data){
        test.ok(false, 'send should not be called');
    };
    test.equals(res3.mime(type), res3);
    test.equals(res3._quip_headers['Content-Type'], type);
    test.done();
};
