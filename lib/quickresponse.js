module.exports = function(){
    return function(req, res, next){

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
        var respondWithType = function(type){
            return function(data){
                if(!res._headers){
                    res._headers = {};
                };
                res._headers['Content-Type'] = type;
                return res.send(data);
            }
        };

        ///// exported methods /////

        // use specific status code
        res.status = function(code){
            res._status = code;
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
        res.text = respondWithType('text/plain');
        res.plain = res.text;

        res.html = respondWithType('text/html');
        res.xhtml = respondWithType('application/xhtml+xml');
        res.css = respondWithType('text/css');
        res.xml = respondWithType('text/xml');
        res.atom = respondWithType('application/atom+xml');
        res.rss = respondWithType('application/rss+xml');
        res.javascript = respondWithType('application/javascript');

        res.json = function(data){
            if(typeof data === 'object'){
                data = JSON.stringify(data);
            }
            res._headers['Content-Type'] = 'application/json';
            return res.send(data);
        };

        // respond with given data using current header and status code
        res.send = function(data){
            res.writeHead(res._status, res._headers);
            if(data) res.write(data);
            res.end();
            return null;
        };

        // finished decorating the request object
        next();

    };
};
