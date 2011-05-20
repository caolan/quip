// filter for use with Connect
var exports = module.exports = function(){
    return function(req, res, next){
        exports.update(res, req);
        next();
    };
};

exports.update = function(res, req){

    ///// default response settings /////
    res._quip_headers = {'Content-Type': 'text/html'};
    res._quip_status = 200;

    ///// private helper methods /////
    var withStatus = function(code){
        return function(data){
            return data ? res.status(code).send(data):
                          res.status(code);
        };
    };
    var redirection = function(code, message){
        return function(loc){
            res._quip_headers.Location = loc;
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
    }
    var withType = function(type){
        return function(data){
            res.headers({'Content-Type': type});
            return data ? res.send(data): res;
        }
    };

    ///// exported methods /////
    res.status = function(code){
        res._quip_status = code;
        return res;
    };
    res.headers = function(headers){
        for(var k in headers) res._quip_headers[k] = headers[k];
        return res;
    };

    // success
    res.ok = withStatus(200);
    res.created = withStatus(201);
    res.accepted = withStatus(202);

    // redirection
    res.moved = redirection(301, 'Moved Permanently');
    res.redirect = redirection(302, 'Found');
    res.found = res.redirect;
    res.notModified = function(){res.status(304).send();};

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
    res.javascript = withType('text/javascript');
    res.json = withType('application/json');

    // JSONP is a special case that should always respond with a 200,
    // there is no reliable way to reveive a JSONP result on the
    // client-side if the HTTP status-code is not 200!
    res.jsonp = function(callback, data){
        if(typeof data == 'object') data = JSON.stringify(data);
        data = callback + '(' + data + ');';
        return res.ok().javascript(data);
    };

    // respond with given data using current header and status code
    res.send = function(data){
        if(res._quip_headers['Content-Type'] == 'application/json'){
            if(typeof data == 'object') data = JSON.stringify(data);
        }
        res.writeHead(res._quip_status, res._quip_headers);
        if(data && req.method != 'HEAD') res.write(data);
        res.end();
        return null;
    };

    return res;

};
