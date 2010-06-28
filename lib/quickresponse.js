exports.update = function(res){

    ///// default response settings /////
    res._headers = {'Content-Type': 'text/html'};
    res._status = 200;

    ///// private helper methods /////
    var withStatus = function(code){
        return function(data){
            return data ? res.status(code).send(data):
                          res.status(code);
        };
    };
    var redirection = function(code, message){
        return function(loc){
            res._headers.Location = loc;
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
        res._status = code;
        return res;
    };
    res.headers = function(headers){
        for(var k in headers) res._headers[k] = headers[k];
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
    res.json = function(data){
        if(typeof data === 'object') data = JSON.stringify(data);
        res.headers({'Content-Type': 'application/json'});
        return data ? res.send(data): res;
    };

    // respond with given data using current header and status code
    res.send = function(data){
        res.writeHead(res._status, res._headers);
        if(data) res.write(data);
        res.end();
        return null;
    };

    return res;

};

// filter for use with Connect
exports.filter = function(){
    return function(req, res, next){
        exports.update(res);
        next();
    };
};
