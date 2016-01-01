'use strict';
const http = require('http'),
  fs = require('fs'),
  _ = require('lodash'),
  uuid = require('node-uuid');

const hostname = '127.0.0.1';
const port = 1337;
const width = 7, height = 6;


const header = fs.readFileSync('./header.html', 'utf8') + gentable();
//create the game board, standard 7x6 size
function gentable() {
  let out = '<div class="board">';
  for(let x=0; x<width; x++) {
    out += `<div class="move${x}">`;
    for(let y=0; y<height; y++) {
      out += '<div></div>';
    }
    out += '</div>';
  }
  out += '</div>';
  return out;
}

const colors = ['red', 'yel'];
function css(str) {
  return `<style>${str}</style>`;
}
//these all get sent multiple times as the game plays out
const templates = {
  puck: (color, x, y) => `<div class="puck ${color}" style="left:${x}00px;top:${y}00px"></div>`,
  turn: (num) => css(`
.turn.${colors[num%2]} {display: block;}
.turn.${colors[num%2]} {display: none;}
`),
  movurl: (index, id, hash) => css(`
.move${index}:active {
  background: url('/move/${id}/${index}/${hash}');
}
`)
}


const actions = {
  play: play,
  move: move
};

const games = {};
const reqs = {};

http.createServer((req, res) => {
  console.log(`GET ${req.url}`);
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
  
  //now use our game id if we have one
  let gid = args[0];
  if(!gid) {
    gid = uuid.v4();
    games[gid] = {
      players: [],
      board: [],
      turn: 0,
      active: false
    }
  }
  const game = games[gid];
  
  //store a UUID we associate with the request
  const id = uuid.v4();
  reqs[id] = {
    req: req,
    res: res,
    gid: gid,
    movhash: _.fill(Array(width), 0)
  };
  req.on('finish', () => {
    //remove them from the games and active requests
    game.players = _.remove(game.players, id);
    if(!game.players.length) {
      delete games[gid];
    }
    delete reqs[id];
  });
  game.players.push(id);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(header);
  for(let i=0; i<width; i++) {
    domovurl(id, i);
  }
  //res.end('</div></div></body></html>');
}
function move(req, res, args) {
  //give an empty response
  res.writeHead(204, {});
  res.end();
  
  const id = args[0], index = +args[1];
  if(!id || !reqs[id]) return;
  console.log(index);
  if(!(index>=0 && index<width)) return;
  
  //TODO add puck
  
  //wait to add a new url, cause otherwise if the mouse is held down it spams requests
  setTimeout(() => {
    if(reqs[id].finished) return; //don't throw an error if they quit or something
    domovurl(id, index);
  }, 500);
}
//send them a new move url so they can click again
//the reason why I do this is because in my tests telling it to expire/not to cache didn't work
function domovurl(id, index) {
  const req = reqs[id];
  const hash = req.movhash[index]++;
  req.res.write(templates.movurl(index,id,hash));
}
function broadcast(gid, text) {
  const game = games[gid];
  Object.keys(game.players).forEach(send.bind(null, gid, text));
}
function send(gid, text, pid) {
  const game = games[gid];
  const res = reqs[game.players[pid]].res;
  res.write(text);
}
