import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../www/',import.meta.url)));
const port=Number(process.env.PORT || 8160);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.resolve(root,'.'+pathname);
    if(target!==root&&!target.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    if((await stat(target)).isDirectory()) target=path.join(target,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache'});
    res.end(await readFile(target));
  } catch {res.writeHead(404).end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Quad Quest: http://localhost:${port}`));
