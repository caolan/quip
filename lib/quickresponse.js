module.exports = function(){
    return function(req, res, next){

        res.status = function(code){
            res._status = code;
            return res;
        };

        var withStatus = function(code){
            return function(){
                return res.status(code);
            };
        };
        var redirection = function(code){
            return function(loc){
                if(loc){
                    if(!res._headers){
                        res._headers = {};
                    };
                    res._headers.Location = loc;
                }
                return res.status(code);
            };
        }

        // success
        res.ok = withStatus(200);
        res.created = withStatus(201);
        res.accepted = withStatus(202);

        // redirection
        res.moved = redirection(301, 'moved');
        res.notModified = withStatus(304);
        res.redirect = redirection(302);

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

        var respondWithType = function(type){
            return function(data){
                if(!res._headers){
                    res._headers = {};
                };
                res._headers['Content-Type'] = type;
                res.send(data);
                return null;
            }
        };

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
            if(!res._headers){
                res._headers = {};
            };
            res._headers['Content-Type'] = 'application/json';
            res.send(data);
            return null;
        };

        res.send = function(data){
            res.writeHead(res._status || 200, res._headers || {});
            res.write(data || '');
            res.end();
        };

        // finished decorating the request object
        next();

    };
};
