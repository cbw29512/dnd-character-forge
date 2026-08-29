import barbarian from "./class-portraits/barbarian.js";
import bard from "./class-portraits/bard.js";
import cleric from "./class-portraits/cleric.js";
import druid from "./class-portraits/druid.js";
import fighter from "./class-portraits/fighter.js";
import monk from "./class-portraits/monk.js";
import paladin from "./class-portraits/paladin.js";
import ranger from "./class-portraits/ranger.js";
import rogue from "./class-portraits/rogue.js";
import sorcerer from "./class-portraits/sorcerer.js";
import warlock from "./class-portraits/warlock.js";
import wizard from "./class-portraits/wizard.js";

const PORTRAITS=Object.freeze({barbarian,bard,cleric,druid,fighter,monk,paladin,ranger,rogue,sorcerer,warlock,wizard});

export function classPortraitDataUrl(classId){
  const id=String(classId||"").trim().toLowerCase();
  return PORTRAITS[id]||"";
}

export function classPortraitArt(classId){
  const id=String(classId||"").trim().toLowerCase();
  const src=PORTRAITS[id];
  if(!src)return "";
  const label=`${id.charAt(0).toUpperCase()+id.slice(1)} class portrait placeholder`;
  return `<img class="ps-class-portrait-image" src="${src}" alt="${label}" decoding="sync">`;
}
