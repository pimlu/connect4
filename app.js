'use strict';
const http = require('http'),
  fs = require('fs');

const hostname = '127.0.0.1';
const port = 1337;
const width = 7, height = 6;


const header = fs.readFileSync('./header.html', 'utf8') + gentable();
//create the game board, standard 7x6 size
function gentable() {
  let out = '<div class="board">';
  for(let x=0; x<width; x++) {
    out += '<div class="move'+x+'">';
    for(let y=0; y<height; y++) {
      out += '<div></div>';
    }
    out += '</div>';
  }
  out += '</div>';
  return out;
}


const actions = {
  play: play,
  menu: menu,
  move: move
};

http.createServer((req, res) => {
  console.log('GET %s', req.url);
  //basic routing of the form /<action>/<param1>/<param2>/<etc
  if(req.url === '/') return play(req, res, []);
  const match = /^\/([a-z]+)\/(.*)$/.exec(req.url);
  if(!match) return nf404(req, res);
  
  const action = actions[match[1]];
  if(!action) return nf404(req, res);
  
  action(req, res, match[2].split('/'));
  
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function nf404(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 not found\n');
}

function play(req, res, args) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(header);
  setTimeout(() => {
    res.write('<div class="puck red" style="position:absolute;top:500px;left:0;"></div>');
    res.end('</div></div></body></html>')
  }, 2000);
}
function menu(req, res, args) {
  res.writeHead(204, {});
  res.end();
}
function move(req, res, args) {
  res.writeHead(204, {});
  res.end();
}