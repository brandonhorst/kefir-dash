var grabString = require('grab-string');
var cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
// var $ = cheerio.load('<h2 class="title">Hello world</h2>');


//Step 2 - copy the HTML documentation

var htmlFileStream = fs.createWriteStream('Kefir.docset/Contents/Resources/Documents/kefir.html')
http.get('http://pozadi.github.io/kefir/', function (response) {
  response
    .pipe(grabString(parse))
    .pipe(htmlFileStream);
});

var svgFileStream = fs.createWriteStream('Kefir.docset/Contents/Resources/Documents/Kefir.svg')
http.get('http://pozadi.github.io/kefir/Kefir.svg', function (response) {
  response.pipe(svgFileStream);
});

//Step 4 - create the SQLite Index

function parse(data) {
  fs.unlink('Kefir.docset/Contents/Resources/docSet.dsidx', function () {
    var db = new sqlite3.Database('Kefir.docset/Contents/Resources/docSet.dsidx');
    var $ = cheerio.load(data);

    db.serialize(function() {
      db.run('CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);');
      db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);')
      var stmt = db.prepare("INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES (?, ?, ?);");

      $('.toc-section a').each(function(index, element) {
        stmt.run($(element).text(), 'Function', 'kefir.html' + $(element).attr('href'));
      })
      stmt.finalize();
    });
    db.close();
  });
}
