var quickresponse = require('quickresponse');


exports.testStatus = function(test){
    var res = {};
    quickresponse()(null, res, function(){
        test.same(res.status(200), res);
        test.equals(res._status, 200);
        test.same(res.status(404), res);
        test.equals(res._status, 404);
    });
    test.done();
};


var statusTest = function(code, name){
    return function(test){
        var res = {};
        quickresponse()(null, res, function(){
            test.same(res[name](), res);
            test.equals(res._status, code);
        });
        test.done();
    };
};

// success codes
exports.testOk = statusTest(200, 'ok');
exports.testCreated = statusTest(201, 'created');
exports.testAccepted= statusTest(202, 'accepted'); // remove this ???

// client error code
exports.testBadRequest = statusTest(400, 'badRequest');
exports.testForbidden = statusTest(403, 'forbidden');
exports.testNotFound = statusTest(404, 'notFound');
exports.testConflict = statusTest(409, 'conflict');
exports.testGone = statusTest(410, 'gone');
exports.testNotAllowed = statusTest(405, 'notAllowed');

// server error codes
exports.testError = statusTest(500, 'error');

var redirectionTest = function(code, name){
    return function(test){
        var res = {};
        quickresponse()(null, res, function(){
            test.same(res[name](), res);
            test.equals(res._status, code);
            res[name]('loc');
            test.equals(res._headers.Location, 'loc');
        });
        test.done();
    };
};

// redirection codes
exports.testNotModified = statusTest(304, 'notModified');
exports.testMoved = redirectionTest(301, 'moved');
exports.testRedirect = redirectionTest(302, 'redirect');

var mimeTypeTest = function(type, name){
    return function(test){
        test.expect(4);
        var res = {};
        quickresponse()(null, res, function(){
            res.send = function(data){
                test.ok(true, 'send called');
                test.equals(this._headers['Content-Type'], type);
                test.equals(data, 'content');
            };
            test.equals(res[name]('content'), null);
        });
        test.done();
    };
};

exports.testText = mimeTypeTest('text/plain', 'plain');
exports.testPlain = mimeTypeTest('text/plain', 'text');
exports.testHtml = mimeTypeTest('text/html', 'html');
exports.testXhtml = mimeTypeTest('application/xhtml+xml', 'xhtml');
exports.testCss = mimeTypeTest('text/css', 'css');
exports.testXml = mimeTypeTest('text/xml', 'xml');
exports.testAtom = mimeTypeTest('application/atom+xml', 'atom');
exports.testRss = mimeTypeTest('application/rss+xml', 'rss');
// should this be text/javscript for better browser support?
exports.testJavascript = mimeTypeTest('application/javascript', 'javascript');
exports.testJson = mimeTypeTest('application/json', 'json');


exports.testSend = function(test){
    test.expect(4);
    var res = {
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
    };
    quickresponse()(null, res, function(){
        res._headers = {headers: 'test'};
        res._status = 404;
        res.send('data');
    });
    test.done();
};

exports.testSendDefaults = function(test){
    test.expect(4);
    var res = {
        writeHead: function(code, headers){
            test.same(headers, {});
            test.equals(code, 200);
        },
        write: function(data){
            test.equals(data, '');
        },
        end: function(){
            test.ok(true, 'end called');
        }
    };
    quickresponse()(null, res, function(){
        res.send();
    });
    test.done();
};
