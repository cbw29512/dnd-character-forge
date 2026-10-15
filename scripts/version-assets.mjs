import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// A release has one content revision shared by its HTML, CSS and module graph.
// Only public copied assets are read; generated build metadata is written later.
export function versionPublicAssets(directory){
  try{
    const files=publicTextFiles(directory).sort();
    const hash=createHash("sha256");
    for(const file of files)hash.update(path.relative(directory,file)).update(fs.readFileSync(file));
    const revision=hash.digest("hex").slice(0,16);
    for(const file of files){
      const source=fs.readFileSync(file,"utf8");
      const updated=file.endsWith(".js")?versionModuleImports(source,revision)
        :file.endsWith(".html")?versionHtmlAssets(source,revision):versionCssImports(source,revision);
      if(updated!==source)fs.writeFileSync(file,updated);
    }
    return revision;
  }catch(error){console.error("[asset-version] Could not version the public release",error);throw error;}
}

function publicTextFiles(directory){
  try{
    return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
      const file=path.join(directory,entry.name);
      return entry.isDirectory()?publicTextFiles(file):/\.(?:js|css|html)$/.test(entry.name)?[file]:[];
    });
  }catch(error){console.error("[asset-version] Could not read public assets",error);throw error;}
}

function revised(specifier,revision){
  const [resource,fragment]=specifier.split("#",2);
  return `${resource}${resource.includes("?")?"&":"?"}release=${revision}${fragment===undefined?"":`#${fragment}`}`;
}

export function versionModuleImports(source,revision){
  try{
    // Leave package names, external URLs and non-JavaScript resources untouched.
    const relative="(\\.{1,2}/[^\\s\\\"']+\\.js(?:\\?[^\\\"'#]*)?(?:#[^\\\"']*)?)";
    const pattern=new RegExp(`(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s*)(["'])${relative}\\2`,"g");
    return source.replace(pattern,(_,prefix,quote,specifier)=>`${prefix}${quote}${revised(specifier,revision)}${quote}`);
  }catch(error){console.error("[asset-version] Could not version module imports",error);throw error;}
}

export function versionHtmlAssets(source,revision){
  try{
    return source.replace(/(<(?:script|link)\b[^>]*?\b(?:src|href)=)(["'])([^"']+\.(?:js|css)(?:\?[^"'#]*)?(?:#[^"']*)?)\2/gi,
      (match,prefix,quote,specifier)=>/^(?:https?:)?\/\//.test(specifier)?match:`${prefix}${quote}${revised(specifier,revision)}${quote}`);
  }catch(error){console.error("[asset-version] Could not version HTML entry assets",error);throw error;}
}

export function versionCssImports(source,revision){
  try{
    return source.replace(/(@import\s+(?:url\(\s*)?)(["'])([^"']+\.css(?:\?[^"'#]*)?(?:#[^"']*)?)\2/gi,
      (match,prefix,quote,specifier)=>/^(?:https?:)?\/\//.test(specifier)?match:`${prefix}${quote}${revised(specifier,revision)}${quote}`);
  }catch(error){console.error("[asset-version] Could not version CSS imports",error);throw error;}
}
