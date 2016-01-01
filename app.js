'use strict';
const http = require('http'),
  fs = require('fs');

const hostname = '127.0.0.1';
const port = 1337;
const width = 7, height = 6;


const header = fs.readFileSync('./header.html', 'utf8') + gentable();

function gentable() {
  let out = '<div class="board">';
  for(let x=0; x<width; x++) {
    out += '<div>';
    for(let y=0; y<height; y++) {
      out += '<div></div>';
    }
    out += '</div>';
  }
  out += '</div>';
  return out;
}

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(header);
  setTimeout(() => {
    res.write('<div class="puck red" style="position:absolute;top:500px;left:0;"></div>');
    res.end('</div></div></body></html>')
  }, 2000);
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});