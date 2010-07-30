var quip = require('quip');


exports.status = function(test){
    test.expect(4);
    var res = quip.update({});
    test.same(res.status(200), res);
    test.equals(res._status, 200);
    test.same(res.status(404), res);
    test.equals(res._status, 404);
    test.done();
};


var statusTest = function(code, name){
    return function(test){
        test.expect(6);

        var res = quip.update({});
        test.same(res[name](), res);
        test.equals(res._status, code);

        var res2 = quip.update({});
        res2.send = function(data){
            test.equals(res2._status, code);
            test.same(res2._headers, {'Content-Type':'text/html'});
            test.equals(data, 'content');
        };
        test.equals(res2[name]('content'), null);
        test.done();
    };
};

// success codes
exports.ok = statusTest(200, 'ok');
exports.created = statusTest(201, 'created');
exports.accepted = statusTest(202, 'accepted'); // remove this ???

// client error code
exports.badRequest = statusTest(400, 'badRequest');
exports.forbidden = statusTest(403, 'forbidden');
exports.notFound = statusTest(404, 'notFound');
exports.conflict = statusTest(409, 'conflict');
exports.gone = statusTest(410, 'gone');
exports.notAllowed = statusTest(405, 'notAllowed');

// server error codes
exports.error = statusTest(500, 'error');

var redirectionTest = function(code, name, body){
    return function(test){
        test.expect(5);
        var res = quip.update({});
        res.send = function(data){
            test.equals(res._status, code);
            test.equals(res._headers.Location, 'loc');
            test.equals(res._headers['Content-Type'], 'text/html');
            test.equals(data, body);
        };
        test.equals(res[name]('loc'), null);
        test.done();
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

exports.notModified = function(test){
    test.expect(8);
    var res = quip.update({});
    res.send = function(data){
        test.equals(res._status, 304);
        test.same(res._headers, {'Content-Type':'text/html'});
        // 304 must not return body
        test.equals(data, null);
    };
    test.equals(res.notModified(), null);
    test.equals(res.notModified('content'), null);
    test.done();
};

var mimeTypeTest = function(type, name){
    return function(test){
        test.expect(6);

        var res = quip.update({});
        res.send = function(data){
            test.ok(true, 'send called');
            test.equals(res._headers['Content-Type'], type);
            test.equals(data, 'content');
        };
        test.equals(res[name]('content'), null);

        var res2 = quip.update({});
        res2.send = function(data){
            test.ok(false, 'send should not be called');
        };
        test.equals(res2[name](), res2);
        test.equals(res2._headers['Content-Type'], type);
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

exports.jsonp = function(test){
    test.expect(7);
    var res = quip.update({});
    res.send = function(data){
        test.equals(data, 'mycallback({"some":"data"});');
        test.equals(res._status, 200);
        test.same(res._headers, {'Content-Type':'text/javascript'});
    };
    var r = res.jsonp('mycallback', {'some':'data'});
    test.equals(r, null); //should not allow further chaining

    // status code should be overridden
    res.error().jsonp('mycallback', {'some':'data'});
    test.done();
};

exports.send = function(test){
    test.expect(4);
    var res = quip.update({
        writeHead: function(code, headers){
            test.same(headers, {headers: 'test'});
            test.equals(code, 404);
        },
        write: function(data){
            test.equals(data, 'data');
        },
        end: function(){
            test.ok(true, 'end called');
        }
    });
    res._headers = {headers: 'test'};
    res._status = 404;
    res.send('data');
    test.done();
};

exports['send defaults'] = function(test){
    test.expect(3);
    var res = quip.update({
        writeHead: function(code, headers){
            test.same(headers, {'Content-Type': 'text/html'});
            test.equals(code, 200);
        },
        write: function(data){
            test.ok(false, 'should not be called if no data');
        },
        end: function(){
            test.ok(true, 'end called');
        }
    });
    res.send();
    test.done();
};

exports['send object literal as json'] = function(test){
    test.expect(6);
    var res = quip.update({
        writeHead: function(code, headers){
            test.ok(true, 'writeHead called');
        },
        write: function(data){
            test.equals(data, '{"test":"object"}');
        },
        end: function(){
            test.ok(true, 'end called');
        }
    });
    res.json({test:'object'});
    res.json().ok({test:'object'});
    test.done();
};

exports.headers = function(test){
    test.expect(3);
    var res = quip.update({});
    test.equals(res.headers({some:'header',test:'test'}), res);
    test.same(res._headers, {
        'Content-Type':'text/html',
        some:'header',
        test:'test'
    });
    res.headers({'Content-Type':'test'});
    test.same(res._headers, {
        'Content-Type':'test',
        some:'header',
        test:'test'
    });
    test.done();
};

exports.filter = function(test){
    test.expect(2);

    var res = {test:'response'};
    var _update = quip.update;
    quip.update = function(r){
        test.equals(r, res);
    };
    quip()(null, res, function(){
        test.ok(true, 'next called');
    });

    quip.update = _update;
    test.done();
};
