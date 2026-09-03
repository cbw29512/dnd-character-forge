import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { originFeatFamilyId, resolveHumanVersatileOriginFeat } from "../src/rules/origin-feats.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {ruleset:"2014",subclass:"fiend",species:"human",background:"acolyte",classSelections:{pactBoon:"tome",eldritchInvocations:["book-of-ancient-secrets","agonizing-blast"]},customization:{style:"ornate",paper:"parchment",ornament:"rich",frame:"filigree",printMode:"premium"}},
  {ruleset:"2024",subclass:"fiend-patron",species:"human",background:"sage",classSelections:{eldritchInvocations:["pact-of-the-tome","pact-of-the-chain","pact-of-the-blade","lessons-of-the-first-ones"]},customization:{style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium"},forceLessonsClericMagic:true}
];
const MAX_CONTENT_2024=Object.freeze({
  backgroundSelections:Object.freeze({spellcastingAbility:"int",cantrip1:"fire-bolt",cantrip2:"mage-hand",level1Spell:"shield"}),
  spellSelections:Object.freeze({
    prepared:Object.freeze(["bane","charm-person","expeditious-retreat","illusory-script","darkness","invisibility","ray-of-enfeeblement","spider-climb","hypnotic-pattern","remove-curse","charm-monster","dream","planar-binding","scrying","teleportation-circle"]),
    arcanum6:Object.freeze(["create-undead"]),arcanum7:Object.freeze(["finger-of-death"]),arcanum8:Object.freeze(["demiplane"]),arcanum9:Object.freeze(["gate"])
  })
});

mkdirSync(OUT,{recursive:true});
for(const item of CASES)verifyPacket(item);
console.log(`[warlock-browser-print] verified ${CASES.length} fixed Warlock premium PDFs in Chrome`);

function verifyPacket(testCase){
  const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-${testCase.species}-warlock`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),layoutTxtPath=path.join(OUT,`${slug}.txt`),semanticTxtPath=path.join(OUT,`${slug}-semantic.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
  assert.equal(character.validation.valid,true,`${slug}: generated Warlock is invalid`);
  assert.equal(character.audit.status,"PASS",`${slug}: Rules Audit did not pass`);
  assert.equal(character.audit.rawIntegrity,true,`${slug}: RAW integrity failed`);
  assert.equal(model.theme.id,"warlock-eldritch",`${slug}: wrong print theme`);
  assert.equal(model.classUtility?.title,"Eldritch Pact",`${slug}: Warlock utility panel missing`);
  assert.equal(model.packet.totalPages,2,`${slug}: Warlock packet is not fixed at two pages`);
  assert.equal(model.spellPage.warlock.pactSlotCount,4,`${slug}: max-level Pact slot count missing`);
  assert.equal(model.spellPage.warlock.pactSlotLevel,5,`${slug}: max-level Pact slot level missing`);
  assert.equal(Object.keys(model.spellPage.warlock.mysticArcanum).length,4,`${slug}: Mystic Arcanum state incomplete`);
  assert.ok(model.equipment.length>0,`${slug}: printable equipment is missing`);
  assert.ok(model.equipment.every(item=>typeof item==="string"&&item.trim()),`${slug}: every printable equipment entry must be a non-empty string`);
  assert.equal(model.equipment.some(item=>item.includes("[object Object]")),false,`${slug}: Warlock print model contains an unformatted inventory object`);
  for(const [key,value] of Object.entries(testCase.customization))assert.equal(model.presentation.customization[key],value,`${slug}: customization ${key}`);
  if(testCase.forceLessonsClericMagic){
    assert.ok(model.spellPage.entries.some(item=>item.name==="Purify Food and Drink"),`${slug}: max-content Lessons fixture did not reach Purify Food and Drink`);
    const lowLevel=model.spellPage.entries.filter(item=>item.level<=1);
    assert.ok(lowLevel.length>=22,`${slug}: deterministic max-content fixture produced only ${lowLevel.length} level-0/1 spell rows`);
  }

  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);
  assert.equal(pages,2,`${slug}: browser PDF is not exactly two pages`);
  assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);

  execFileSync("pdftotext",["-layout",pdfPath,layoutTxtPath]);
  execFileSync("pdftotext",[pdfPath,semanticTxtPath]);
  execFileSync("pdftoppm",["-png","-r","120",pdfPath,pngPrefix]);
  const layoutExtracted=readFileSync(layoutTxtPath,"utf8"),semanticExtracted=readFileSync(semanticTxtPath,"utf8"),pagesText=pdfPages(layoutExtracted);
  assert.equal(pagesText.length,pages,`${slug}: extracted page count mismatch`);
  for(let index=0;index<pagesText.length;index++){
    const text=normalize(pagesText[index]);assert.ok(text.length>500,`${slug}: page ${index+1} is suspiciously sparse (${text.length} chars)`);assert.match(text,new RegExp(`Page\\s+${index+1}\\s*\\/\\s*${pages}`,"i"),`${slug}: page marker missing`);
  }

  const whole=normalize(semanticExtracted),fold=whole.toLowerCase(),tokens=[character.name,...model.attacks.map(item=>item.name),...model.equipment,...model.ruleIndex.map(item=>item.name),model.classUtility.title,...model.spellPage.entries.map(item=>item.name)];
  assert.equal(fold.includes("[object object]"),false,`${slug}: printed PDF exposed an unformatted inventory object`);
  for(const token of tokens)assert.ok(fold.includes(normalize(token).toLowerCase()),`${slug}: printed PDF lost expected content: ${token}`);
  for(const phrase of ["RAW Integrity","Eldritch Pact","Pact Resources","Pact Magic","Eldritch Invocations","Mystic Arcanum"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing Warlock contract text: ${phrase}`);

  assert.equal(character.spells.tome.cantrips.length,3,`${slug}: Tome cantrips missing`);
  assert.equal(character.spells.tome.rituals.length,2,`${slug}: Tome rituals missing`);
  if(testCase.ruleset==="2014"){
    assert.equal(character.warlockSelections.pactBoon.id,"tome");
    for(const phrase of ["The Fiend","Otherworldly Patron","Pact Boon: Pact of the Tome","Book of Ancient Secrets","Eldritch Master"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing 2014 Warlock text: ${phrase}`);
    for(const phrase of ["Magical Cunning","Contact Patron","Warlock Subclass","Boon of Fate"])assert.equal(fold.includes(normalize(phrase).toLowerCase()),false,`${slug}: leaked 2024 Warlock text: ${phrase}`);
  }else{
    assert.ok(character.warlockSelections.familiarForm,`${slug}: Pact familiar missing`);
    assert.ok(character.attacks.some(attack=>attack.pactWeapon&&attack.ability==="cha"),`${slug}: Charisma pact weapon missing`);
    assert.ok(character.spells.alwaysPrepared.includes("contact-other-plane"),`${slug}: Contact Patron spell missing`);
    assert.ok(model.ruleIndex.some(item=>item.name.startsWith("Lessons of the First Ones")),`${slug}: deterministic long invocation rule missing from print model`);
    for(const phrase of ["Fiend Patron","Magical Cunning","Contact Patron","Pact of the Tome","Pact of the Chain","Pact of the Blade","Lessons of the First Ones","Boon of Fate"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing 2024 Warlock text: ${phrase}`);
    if(testCase.forceLessonsClericMagic)assert.ok(fold.includes("purify food and drink"),`${slug}: max-content Lessons spell was clipped from the PDF`);
    for(const phrase of ["Otherworldly Patron","Pact Boon: Pact of the Tome"])assert.equal(fold.includes(normalize(phrase).toLowerCase()),false,`${slug}: leaked 2014 Warlock text: ${phrase}`);
  }
  console.log(`[warlock-browser-print] ${slug}: ${pages} Letter pages · ${model.ruleIndex.length} rules · ${model.equipment.length} equipment · ${model.spellPage.entries.length} spells · ${model.presentation.customization.style}/${model.presentation.customization.printMode}`);
}

function characterAt({ruleset,subclass,species,background,classSelections,customization,forceLessonsClericMagic=false}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="warlock";state.constraints.subclass=subclass;state.constraints.species=species;state.constraints.background=background;state.classSelections=classSelections;
  if(forceLessonsClericMagic){state.backgroundSelections={...MAX_CONTENT_2024.backgroundSelections};state.spellSelections={prepared:[...MAX_CONTENT_2024.spellSelections.prepared],arcanum6:[...MAX_CONTENT_2024.spellSelections.arcanum6],arcanum7:[...MAX_CONTENT_2024.spellSelections.arcanum7],arcanum8:[...MAX_CONTENT_2024.spellSelections.arcanum8],arcanum9:[...MAX_CONTENT_2024.spellSelections.arcanum9]};}
  const originalRandom=Math.random;let character;
  try{if(forceLessonsClericMagic)Math.random=()=>0;character=generateCharacter(state);}
  finally{Math.random=originalRandom;}
  if(forceLessonsClericMagic)forceClericLessonsGrant(character);character.presentation={...(character.presentation||{}),sheetCustomization:customization};return character;
}
function forceClericLessonsGrant(character){
  const existingFeats=(character.feats||[]).filter(feat=>feat?.source!=="warlock"),existingMagic=(character.magicInitiates||[]).filter(choice=>choice?.source!=="warlock"),resolved=resolveHumanVersatileOriginFeat({
    selections:{originFeat:"magic-initiate",magicInitiateList:"cleric",originSpellcastingAbility:"cha",originCantrip1:"guidance",originCantrip2:"thaumaturgy",originLevel1Spell:"purify-food-and-drink"},
    existingFeats,existingMagicInitiates:existingMagic,skills:character.skills||[],tools:character.toolProficiencies||[],source:"warlock",contextLabel:"Lessons of the First Ones"
  });
  assert.ok(resolved.magicInitiate,"2024 Warlock max-content fixture failed to resolve Magic Initiate (Cleric)");
  character.feats=[...existingFeats,resolved.feat];
  character.magicInitiates=[...existingMagic,resolved.magicInitiate];
  character.warlockSelections={...(character.warlockSelections||{}),lessonsOriginFeats:[{id:resolved.feat.id,family:originFeatFamilyId(resolved.feat),name:resolved.feat.name}]};
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function pdfPages(text){const pages=String(text||"").split("\f");while(pages.length&&normalize(pages.at(-1))==="")pages.pop();return pages;}
function normalize(value){return String(value||"").replace(/[’‘]/g,"'").replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}