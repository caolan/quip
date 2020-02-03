/**
 * This function can be called with quip(res) or quip(req, res, next).
 * See README for examples.
 */

module.exports = function (req, res, next) {
    if (arguments.length === 1) {
        res = req;
        req = null;
    }

    ///// default response settings /////
    res.statusCode = 200;

    ///// private helper methods /////
    var withStatus = function (code) {
        return function (data) {
            return data ? res.status(code).send(data):
                          res.status(code);
        };
    };
    var withStatusAndSend = function (code) {
        return function (data) {
            return res.status(code).send();
        };
    };
    var redirection = function (code, message) {
        return function (loc) {
            res.setHeader('Location', loc);
            return res.status(code).send(
                '<html>' +
                    '<head>' +
                        '<title>' + code + ' ' + message + '</title>' +
                    '</head>' +
                    '<body>' +
                        '<p>' +
                            message + ': ' +
                            '<a href="' + loc + '">' + loc + '</a>' +
                        '</p>' +
                    '</body>' +
                '</html>'
            );
        };
    };
    var withType = function (type) {
        return function (data) {
            res.setHeader('Content-Type', type);
            return data ? res.send(data): res;
        };
    };

    ///// exported methods /////
    res.status = function (code) {
        res.statusCode = code;
        return res;
    };
    res.headers = function (headers) {
        for(var header in headers){
            res.setHeader(header, headers[header]);
        }
        return res;
    };

    // success
    res.ok = withStatus(200);
    res.created = withStatus(201);
    res.accepted = withStatus(202);
    res.noContent = withStatusAndSend(204);

    // redirection
    res.moved = redirection(301, 'Moved Permanently');
    res.redirect = redirection(302, 'Found');
    res.found = res.redirect;
    res.notModified = function () {
        res.status(304).send();
    };

    // client error
    res.badRequest = withStatus(400);
    res.unauthorized = withStatus(401);
    res.forbidden = withStatus(403);
    res.notFound = withStatus(404);
    res.notAllowed = withStatus(405);
    res.conflict = withStatus(409);
    res.gone = withStatus(410);

    // server error
    res.error = withStatus(500, 'error');

    // mime types
    res.text = withType('text/plain');
    res.plain = res.text;
    res.html = withType('text/html');
    res.xhtml = withType('application/xhtml+xml');
    res.css = withType('text/css');
    res.xml = withType('text/xml');
    res.atom = withType('application/atom+xml');
    res.rss = withType('application/rss+xml');
    res.javascript = withType('application/javascript');
    res.json = withType('application/json');

    // custom mime type
    res.mime = function (type, data) {
        res.setHeader('Content-Type', type);
        return data ? res.send(data): res;
    };

    // JSONP is a special case that should always respond with a 200,
    // there is no reliable way to receive a JSONP result on the
    // client-side if the HTTP status-code is not 200!
    res.jsonp = function (callback, data) {
        if(typeof data == 'object') data = JSON.stringify(data);
        data = callback + '(' + data + ');';
        return res.ok().javascript(data);
    };

    // respond with given data using current header and status code
    res.send = function (data) {
        if (data) {
            if (Buffer.isBuffer(data)) {
                res.setHeader('Content-Length', data.length);
            }
            else {
                if (typeof data === 'object') {
                    // assume data is JSON if passed an object (not a buffer)
                    if (!res.getHeader('Content-Type')) {
                        res.setHeader('Content-Type', 'application/json');
                    }
                    data = JSON.stringify(data);
                }
                res.setHeader('Content-Length', Buffer.byteLength(data));
            }
        }
        if (!res.getHeader('Content-Type')) {
            // assume HTML if data is a string and content type not set
            res.setHeader('Content-Type', 'text/html');
        }
        res.writeHead(res.statusCode);
        res.end(data);
        return null;
    };

    if (next) {
        // pass updated response object onto next connect middleware
        return next(null, res);
    }
    // called directly, return updated response object
    return res;
};
