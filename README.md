# quickresponse

An exploration of a chainable API for response objects in node.

* Suited to quick and easy prototyping
* Works as a [Connect](http://github.com/extjs/Connect) filter


## Examples

    // responding with different status codes
    res.ok('<h1>Hello World!</h1>');
    res.notFound('Not found');

    // responding with different mime types
    res.text('plain text');
    res.json({'stringify': 'this object'});

    // chaining the two together
    res.error().json({error: 'something broke'});
    res.xml().ok('<test></test>');

    // redirection
    res.moved('http://permanent/new/location');
    res.redirect('http://temporary/new/location');

    // custom headers
    res.headers({'custom': 'header'}).text('some data');

The response is completed when data is passed to a status code or mime-type
function, or when a redirect is performed.


## Usage

As a [Connect](http://github.com/extjs/Connect) filter:

    var Connect = require('connect'),
        quickresponse = require('quickresponse'),

    Connect.createServer(
        quickresponse.filter(),
        function(req, res, next){
            res.ok('test');
        }
    ).listen(8080);

Standalone, without Connect:

    var quickresponse = require('quickresponse'),
        http = require('http');

    http.createServer(function(req, res){
        quickresponse.update(res);
        res.ok('test');
    });


## API

* headers - add custom headers to response, returns updated response object
* status - set status code of response manually, returns updated response
* send - send data with the status code and headers already set, returns null

### Status Codes

By default, the response will have the status code 200 (OK), this can
be updated using the following methods. Note that by passing some data
to these methods, the response will complete. If you don't pass data it will
return an updated response object, allowing you to chain calls together.

#### Success
* res.ok
* res.created
* res.accepted

### Redirection
* res.moved
* res.redirect
* res.found - alias for redirect
* res.notModified

### Client Error
* res.badRequest
* res.unauthorized
* res.forbidden
* res.notFound
* res.notAllowed
* res.conflict
* res.gone

### Server Error
* res.error

## Mime Types

By default, the response will have the mime-type text/html, this can
be updated using the following methods. Note that by passing some data
to these methods, the response will complete. If you don't pass data it will
return an updated response object, allowing you to chain calls together.

* res.text
* res.plain
* res.html
* res.xhtml
* res.css
* res.xml
* res.atom
* res.rss
* res.javascript
* res.json
