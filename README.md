# quip

A convenient chainable API for HTTP ServerResponse objects in node.

* Suited to quick and easy prototyping
* Works as a [Connect](http://github.com/extjs/Connect) middleware
* Allows you to pipe streams to the response, while easily setting up
  the headers and status code beforehand


## Examples

#### responding with different status codes

```javascript
res.ok('<h1>Hello World!</h1>');
res.notFound('Not found');
```

#### responding with different mime types

```javascript
res.text('plain text');
res.json({'stringify': 'this object'});
```

#### chaining the two together (in any order)

```javascript
res.error().json({error: 'something broke'});
res.xml().badRequest('<test></test>');
```

#### redirection

```javascript
res.moved('http://permanent/new/location');
res.redirect('http://temporary/new/location');
```

#### custom headers

```javascript
res.headers({'custom': 'header'}).text('some data');
```

#### piping data to a response object

```javascript
// read posts.xml and pipe to response with mime type application/atom+xml
var feed = fs.createReadStream('posts.xml');
feed.pipe(res.atom());
```

The response is completed when data is passed to a status code or mime-type
function, when a redirect is performed, or when a stream is piped to the
response.


## Usage

Use quip for specific responses:

    var quip = require('quip'),
        http = require('http');

    http.createServer(function (req, res) {
        quip(res).ok('example');
    });

Enable for all response objects by using quip as a
[Connect](http://www.senchalabs.org/connect/) middleware:

    var connect = require('connect'),
        quip = require('quip'),

    var app = connect(
        quip,
        function (req, res, next) {
            res.ok('example');
        }
    );


## API

* headers - add custom headers to response, returns updated response object
* status - set status code of response manually, returns updated response

### Status Codes

By default, the response will have the status code 200 (OK), this can
be updated using the following methods. Note that by passing some data
to these methods, the response will complete. If you don't pass data it will
return an updated response object, allowing you to chain calls together. If
the data passed is an object then it will be treated as JSON and the mime
type of the response will be updated accordingly.

#### Success
* res.ok
* res.created
* res.accepted

#### Redirection
* res.moved
* res.redirect
* res.found - alias for redirect
* res.notModified

#### Client Error
* res.badRequest
* res.unauthorized
* res.forbidden
* res.notFound
* res.notAllowed
* res.conflict
* res.gone

#### Server Error
* res.error

### Mime Types

By default, the response will have the mime-type text/html, this can
be updated using the following methods. Note that by passing some data
to these methods, the response will complete. If you don't pass data it will
return an updated response object, allowing you to chain calls together.
You can pass an object to the json and jsonp methods and it will be
stringified before sending.

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

* res.jsonp -- JSONP is a special case that __always__ completes the request,
  and overrides any previous status code calls. There is no reliable way for
  a browser to interpret JSONP responses with a status code other than 200.
  Any error or status information should be included in the JSONP response
  itself. The jsonp method accepts 2 arguments, a callback name (string) and
  some JSON data (either a string or an object literal).
