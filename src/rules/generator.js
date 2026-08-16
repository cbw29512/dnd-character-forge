import { RANDOM, SOURCE, ABILITIES, SKILLS } from "../schema.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { pick, sample } from "./random.js";
import { generateBaseAbilities, apply2014Species, apply2024Background } from "./abilities.js";
import { abilityMod, proficiencyBonus, calculateAc, averageHp } from "./math.js";
import { fighterFeatures, applyFighterAsi } from "./features.js";
import { applyHomebrew } from "./homebrew.js";
import { validateCharacter } from "./validation.js";
import { uniqueStrings, uniqueBy, consolidateInventory } from "./duplicates.js";

const NAMES = ["Aric Vale","Mira Stone","Tavian Reed","Selene Hart","Bren Ashford","Kael Rowan"];
const ALL_SKILLS = Object.keys(SKILLS);
const LANGUAGES_2014 = ["Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc","Draconic","Celestial","Infernal","Sylvan"];
const LANGUAGES_2024 = ["Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc"];
const dataFor = ruleset => ruleset === "2014" ? RAW_2014 : RAW_2024;
const resolve = (value, items) => value && value !== RANDOM ? items.find(i=>i.id===value) : pick(items);

export function generateCharacter(state) {
  try {
    const data = dataFor(state.ruleset);
    const level = state.constraints.level === RANDOM ? 1 + Math.floor(Math.random() * 5) : Number(state.constraints.level);
    const species = resolve(state.constraints.species, data.species), cls = resolve(state.constraints.class, data.classes);
    const background = resolve(state.constraints.background, data.backgrounds);
    const subclass = level >= cls.subclassLevel ? resolve(state.constraints.subclass, data.subclasses.filter(s=>s.classId===cls.id)) : null;
    let abilities = generateBaseAbilities("standard");
    abilities = state.ruleset === "2014" ? apply2014Species(abilities, species) : apply2024Background(abilities, background, cls.primary);
    abilities = applyFighterAsi(abilities, level);
    const skills = uniqueStrings([...(background.skills||[]), ...sample(cls.skillChoices, cls.skillCount, background.skills||[])]);
    if (state.ruleset === "2024" && species.extraSkills) skills.push(...sample(ALL_SKILLS, species.extraSkills, skills));
    const equipment = pick(cls.equipmentPackages), fightingStyle = data.fightingStyles[pick(equipment.styles)];
    let character = {
      id:crypto.randomUUID(), sourceMode:state.sourceMode, ruleset:state.ruleset, level,
      name:state.constraints.name.trim()||pick(NAMES), species, size:resolveSize(state.ruleset,species), class:cls, subclass, background,
      abilities, abilityMaximums:Object.fromEntries(ABILITIES.map(a=>[a,20])), skills,
      saves:cls.saves, proficiency:proficiencyBonus(level), equipment, fightingStyle,
      languages:resolveLanguages(state.ruleset, background), feats:[], homebrew:[], homebrewAcBonus:0,
      features:fighterFeatures(state.ruleset, level, subclass?.id)
    };
    character.features.push(`Fighting Style: ${fightingStyle.name}`);
    if (state.ruleset === "2024") character = apply2024Feats(character, data, background, species);
    if (state.sourceMode === SOURCE.HOMEBREW) character = applyHomebrew(character, state.homebrew);
    character = derive(character, data);
    const validation = validateCharacter(character, state.sourceMode);
    if (!validation.valid) throw new Error(validation.errors.join(" "));
    return { ...character, validation };
  } catch (error) { console.error("[generator] Character generation blocked", error); throw error; }
}
function resolveSize(ruleset, species) {
  try { return ruleset === "2024" && species.size.includes("or") ? pick(["Small","Medium"]) : species.size; }
  catch (error) { console.error("[generator] size resolution failed", error); throw error; }
}
function resolveLanguages(ruleset, background) {
  try {
    if (ruleset === "2024") return ["Common", ...sample(LANGUAGES_2024,2)];
    return ["Common", ...sample(LANGUAGES_2014,1+(background.languages||0))];
  } catch (error) { console.error("[generator] language resolution failed", error); throw error; }
}
function apply2024Feats(character, data, background, species) {
  try {
    const next=structuredClone(character), feats=[data.feats.find(f=>f.id===background.feat)];
    if (species.originFeat) feats.push(pick(data.feats.filter(f=>f.category==="Origin"&&!feats.some(x=>x.id===f.id))));
    next.feats=uniqueBy(feats.filter(Boolean), feat=>feat.id);
    for (const feat of next.feats) if (feat.extraSkills) next.skills.push(...sample(ALL_SKILLS,feat.extraSkills,next.skills));
    return next;
  } catch (error) { console.error("[generator] feat resolution failed", error); throw error; }
}
function derive(character, data) {
  try {
    const dex=abilityMod(character.abilities.dex), con=abilityMod(character.abilities.con), pb=character.proficiency;
    const acBonus=character.homebrewAcBonus+(character.fightingStyle.acBonus||0);
    const ac=calculateAc(data.armor[character.equipment.armor],dex,character.equipment.shield,acBonus);
    const hp=averageHp(character.class.hitDie,character.level,con);
    const alert=character.feats.some(f=>f.id==="alert")?pb:0;
    const saveBonuses=Object.fromEntries(ABILITIES.map(a=>[a,abilityMod(character.abilities[a])+(character.saves.includes(a)?pb:0)]));
    const skillBonuses=Object.fromEntries(Object.entries(SKILLS).map(([s,a])=>[s,abilityMod(character.abilities[a])+(character.skills.includes(s)?pb:0)]));
    const attacks=character.equipment.weapons.map(id=>{
      const weapon=data.weapons[id], mod=abilityMod(character.abilities[weapon.ability]);
      const styleBonus=["longbow","light-crossbow"].includes(id)?(character.fightingStyle.rangedAttackBonus||0):0;
      return {...weapon,attackBonus:mod+pb+styleBonus,damageBonus:mod};
    });
    const masteryCount=character.ruleset==="2024"?(character.level>=4?4:3):0;
    const masteryIds=masteryCount? [...new Set([...character.equipment.weapons,...sample(Object.keys(data.weapons),Math.max(0,masteryCount-character.equipment.weapons.length),character.equipment.weapons)])].slice(0,masteryCount):[];
    const inventory=consolidateInventory([...attacks.map(attack=>attack.name),...character.equipment.gear,...character.background.equipment]);
    return {...character,skills:uniqueStrings(character.skills),languages:uniqueStrings(character.languages),feats:uniqueBy(character.feats,feat=>feat.id),homebrew:uniqueBy(character.homebrew,item=>item.id),features:uniqueStrings(character.features),ac,hp,initiative:dex+alert,speed:character.species.speed,attacks:uniqueBy(attacks,attack=>attack.name),saveBonuses,skillBonuses,passivePerception:10+skillBonuses.perception,masteryIds:uniqueStrings(masteryIds),inventory};
  } catch (error) { console.error("[generator] derivation failed", error); throw error; }
}
