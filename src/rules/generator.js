import { RANDOM, SOURCE, ABILITIES, SKILLS } from "../schema.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { pick, sample } from "./random.js";
import { generateBaseAbilities, apply2014Species, apply2024Background } from "./abilities.js";
import { abilityMod, proficiencyBonus, calculateAc, averageHp } from "./math.js";
import { applyClassAsi } from "./features.js";
import { resolveClassFeatures } from "./class-features.js";
import { applyBarbarianAbilityProgression, barbarianAbilityMaximums, barbarianProgression, barbarianResources, barbarianSpeed, barbarianUnarmoredAc } from "./barbarian.js";
import { buildWizardSpellcasting } from "./wizard.js";
import { buildClericSpellcasting, resolveDivineOrder } from "./cleric.js";
import { validateCharacter } from "./validation.js";
import { uniqueStrings, uniqueBy, consolidateInventory } from "./duplicates.js";

const NAMES=["Aric Vale","Mira Stone","Tavian Reed","Selene Hart","Bren Ashford","Kael Rowan"],ALL_SKILLS=Object.keys(SKILLS);
const LANGUAGES_2014=["Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc","Draconic","Celestial","Infernal","Sylvan"],LANGUAGES_2024=["Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc"],SCHOLAR_SKILLS=["arcana","history","investigation","medicine","nature","religion"];
const BARBARIAN_MASTERY_POOL=["greataxe","handaxe","greatsword","longsword","flail","javelin","scimitar","shortsword","dagger","quarterstaff","mace"];
const dataFor=ruleset=>ruleset==="2014"?RAW_2014:RAW_2024,resolve=(value,items)=>value&&value!==RANDOM?items.find(i=>i.id===value):pick(items);

export function generateCharacter(state){
  try{
    if(state.sourceMode!==SOURCE.RAW)throw new Error("Production Character Forge accepts RAW mode only.");
    if((state.homebrew||[]).length)throw new Error("Production Character Forge rejects Homebrew mechanics.");
    if(!["2014","2024"].includes(state.ruleset))throw new Error("Unsupported rules edition.");
    const data=dataFor(state.ruleset),species=resolve(state.constraints.species,data.species),cls=resolve(state.constraints.class,data.classes),background=resolve(state.constraints.background,data.backgrounds);if(!species||!cls||!background)throw new Error("A selected character option is unavailable for this ruleset.");
    const level=resolveLevel(state.constraints.level,state.constraints.subclass,cls);if(level<1||level>(cls.maxLevel||5))throw new Error(`${cls.name} is verified through level ${cls.maxLevel||5}.`);
    const subclasses=data.subclasses.filter(item=>item.classId===cls.id),subclass=level>=cls.subclassLevel&&subclasses.length?resolve(state.constraints.subclass,subclasses):null;if(state.constraints.subclass!==RANDOM&&!subclass)throw new Error(`${cls.name} subclass choice is not legal at level ${level}.`);
    let abilities=generateBaseAbilities("standard",cls.abilityPriority);abilities=state.ruleset==="2014"?apply2014Species(abilities,species):apply2024Background(abilities,background,cls.primary);abilities=cls.id==="barbarian"?applyBarbarianAbilityProgression(abilities,state.ruleset,level):applyClassAsi(abilities,level,cls.primary);
    const skills=uniqueStrings([...(background.skills||[]),...sample(cls.skillChoices,cls.skillCount,background.skills||[])]);if(state.ruleset==="2024"&&species.extraSkills)skills.push(...sample(ALL_SKILLS,species.extraSkills,skills));if(state.ruleset==="2024"&&cls.id==="barbarian"&&level>=3)skills.push(...sample(cls.skillChoices,1,skills));
    const equipment=pick(cls.equipmentPackages),fightingStyle=cls.id==="fighter"?data.fightingStyles[pick(equipment.styles)]:null,divineOrder=cls.id==="cleric"?resolveDivineOrder(state.ruleset,state.spellSelections||{}):null;
    const features=resolveClassFeatures({ruleset:state.ruleset,classId:cls.id,level,subclassId:subclass?.id||null,divineOrder});
    const maxima=Object.fromEntries(ABILITIES.map(a=>[a,20]));if(cls.id==="barbarian")Object.assign(maxima,barbarianAbilityMaximums(state.ruleset,level));
    let character={id:crypto.randomUUID(),sourceMode:SOURCE.RAW,ruleset:state.ruleset,level,name:state.constraints.name.trim()||pick(NAMES),species,size:resolveSize(state.ruleset,species),class:cls,subclass,background,abilities,abilityMaximums:maxima,skills,expertise:[],saves:cls.saves,proficiency:proficiencyBonus(level),equipment,fightingStyle,divineOrder,languages:resolveLanguages(state.ruleset,background),feats:[],homebrew:[],homebrewAcBonus:0,features,spells:null,classResources:cls.id==="barbarian"?barbarianResources(state.ruleset,level):[]};
    if(fightingStyle)character.features.push(`Fighting Style: ${fightingStyle.name}`);if(state.ruleset==="2024")character=apply2024Feats(character,data,background,species);if(state.ruleset==="2024"&&cls.id==="barbarian"&&level>=19){const boon=data.feats.find(f=>f.id==="boon-irresistible-offense");if(!boon)throw new Error("Verified Barbarian Epic Boon is missing.");character.feats=uniqueBy([...character.feats,boon],feat=>feat.id);}if(state.ruleset==="2024"&&cls.id==="wizard"&&level>=2)character.expertise=[pick(character.skills.filter(skill=>SCHOLAR_SKILLS.includes(skill)))];
    if(cls.spellcasting==="wizard")character.spells=buildWizardSpellcasting(character,state.spellSelections||{});if(cls.spellcasting==="cleric")character.spells=buildClericSpellcasting(character,state.spellSelections||{});
    character=derive(character,data);const validation=validateCharacter(character,SOURCE.RAW);if(!validation.valid)throw new Error(validation.errors.join(" "));return{...character,validation};
  }catch(error){console.error("[generator] Character generation blocked",error);throw error;}
}
function resolveLevel(value,subclassValue,cls){try{if(value!==RANDOM)return Number(value);const minimum=subclassValue&&subclassValue!==RANDOM?cls.subclassLevel:1,maximum=cls.maxLevel||5;return minimum+Math.floor(Math.random()*(maximum-minimum+1));}catch(error){console.error("[generator] level resolution failed",error);throw error;}}
function resolveSize(ruleset,species){try{return ruleset==="2024"&&species.size.includes("or")?pick(["Small","Medium"]):species.size;}catch(error){console.error("[generator] size resolution failed",error);throw error;}}
function resolveLanguages(ruleset,background){try{return ruleset==="2024"?["Common",...sample(LANGUAGES_2024,2)]:["Common",...sample(LANGUAGES_2014,1+(background.languages||0))];}catch(error){console.error("[generator] language resolution failed",error);throw error;}}
function apply2024Feats(character,data,background,species){try{const next=structuredClone(character),feats=[data.feats.find(f=>f.id===background.feat)];if(species.originFeat)feats.push(pick(data.feats.filter(f=>f.category==="Origin"&&!feats.some(x=>x.id===f.id))));next.feats=uniqueBy(feats.filter(Boolean),feat=>feat.id);for(const feat of next.feats)if(feat.extraSkills)next.skills.push(...sample(ALL_SKILLS,feat.extraSkills,next.skills));return next;}catch(error){console.error("[generator] feat resolution failed",error);throw error;}}
function derive(character,data){
  try{
    const dex=abilityMod(character.abilities.dex),con=abilityMod(character.abilities.con),pb=character.proficiency,acBonus=character.homebrewAcBonus+(character.fightingStyle?.acBonus||0),armor=character.equipment.armor?data.armor[character.equipment.armor]:null;
    const ac=character.class.id==="barbarian"&&!armor?barbarianUnarmoredAc(character.abilities,character.equipment.shield):calculateAc(armor,dex,character.equipment.shield,acBonus),hp=averageHp(character.class.hitDie,character.level,con),alert=character.feats.some(f=>f.id==="alert")?pb:0;
    const saveBonuses=Object.fromEntries(ABILITIES.map(a=>[a,abilityMod(character.abilities[a])+(character.saves.includes(a)?pb:0)])),thaumaturge=character.ruleset==="2024"&&character.class.id==="cleric"&&character.divineOrder==="thaumaturge"?Math.max(1,abilityMod(character.abilities.wis)):0;
    const skillBonuses=Object.fromEntries(Object.entries(SKILLS).map(([s,a])=>[s,abilityMod(character.abilities[a])+(character.skills.includes(s)?pb:0)+(character.expertise.includes(s)?pb:0)+(["arcana","religion"].includes(s)?thaumaturge:0)]));
    const attacks=character.equipment.weapons.map(id=>{const weapon=data.weapons[id];if(!weapon)throw new Error(`Unknown weapon ${id}.`);const mod=abilityMod(character.abilities[weapon.ability]),styleBonus=["longbow","light-crossbow"].includes(id)?(character.fightingStyle?.rangedAttackBonus||0):0;return{...weapon,id,attackBonus:mod+pb+styleBonus,damageBonus:mod};});
    const masteryCount=resolveMasteryCount(character),masteryPool=character.class.id==="barbarian"?BARBARIAN_MASTERY_POOL.filter(id=>data.weapons[id]):Object.keys(data.weapons),masteryIds=masteryCount?[...new Set([...character.equipment.weapons,...sample(masteryPool,Math.max(0,masteryCount-character.equipment.weapons.length),character.equipment.weapons)])].slice(0,masteryCount):[];
    const attackInventory=attacks.map(attack=>character.equipment.focus===attack.id?`Arcane Focus (${attack.name})`:attack.name),inventory=consolidateInventory([...attackInventory,...character.equipment.gear,...character.background.equipment]),speed=character.class.id==="barbarian"?barbarianSpeed(character.species.speed,character.level,Boolean(armor?.heavy)):character.species.speed;
    return{...character,skills:uniqueStrings(character.skills),expertise:uniqueStrings(character.expertise),languages:uniqueStrings(character.languages),feats:uniqueBy(character.feats,feat=>feat.id),homebrew:[],features:uniqueStrings(character.features),ac,hp,initiative:dex+alert,speed,attacks:uniqueBy(attacks,attack=>attack.name),saveBonuses,skillBonuses,passivePerception:10+skillBonuses.perception,masteryIds:uniqueStrings(masteryIds),inventory};
  }catch(error){console.error("[generator] derivation failed",error);throw error;}
}
function resolveMasteryCount(character){try{if(character.ruleset!=="2024")return 0;if(character.class.id==="fighter")return character.level>=4?4:3;if(character.class.id==="barbarian")return barbarianProgression("2024",character.level).masteries;return 0;}catch(error){console.error("[generator] mastery count failed",error);throw error;}}
