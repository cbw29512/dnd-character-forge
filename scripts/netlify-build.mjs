import fs from "node:fs";
import path from "node:path";

const ROOT=process.cwd();
const OUT=path.join(ROOT,"_site");
const LEGACY_BASE="https://cbw29512.github.io/dnd-character-forge/";
const rawSiteUrl=process.env.URL||process.env.SITE_URL||process.env.DEPLOY_PRIME_URL;

if(!rawSiteUrl){
  throw new Error("Netlify production URL is unavailable. Expected URL, SITE_URL, or DEPLOY_PRIME_URL.");
}

const normalized=new URL(rawSiteUrl);
normalized.hash="";
normalized.search="";
normalized.pathname=normalized.pathname.replace(/\/?$/,"/");
const SITE_URL=normalized.href;

const publicDirs=["assets","src","styles","share"];
const publicFiles=[
  "index.html",
  "privacy.html",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "404.html"
];

fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});

for(const dir of publicDirs){
  fs.cpSync(path.join(ROOT,dir),path.join(OUT,dir),{recursive:true});
}
for(const file of publicFiles){
  const source=path.join(ROOT,file);
  if(fs.existsSync(source))fs.copyFileSync(source,path.join(OUT,file));
}

for(const relative of ["index.html","share/index.html","robots.txt","sitemap.xml"]){
  const target=path.join(OUT,relative);
  const source=fs.readFileSync(target,"utf8");
  fs.writeFileSync(target,source.replaceAll(LEGACY_BASE,SITE_URL));
}

const commit=process.env.COMMIT_REF||process.env.GITHUB_SHA||"unknown";
const branch=process.env.BRANCH||process.env.HEAD||"unknown";
fs.writeFileSync(path.join(OUT,"build-info.json"),JSON.stringify({
  app:"dnd-character-forge",
  commit,
  branch,
  siteUrl:SITE_URL,
  builtAt:new Date().toISOString()
},null,2)+"\n");

console.log(`[netlify-build] prepared ${OUT}`);
console.log(`[netlify-build] canonical ${SITE_URL}`);
console.log(`[netlify-build] commit ${commit}`);
