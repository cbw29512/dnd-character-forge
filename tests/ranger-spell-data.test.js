import test from "node:test";
import assert from "node:assert/strict";
import { RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024, RANGER_SPELLS_2014, RANGER_SPELLS_2024 } from "../src/data/ranger-spells.js";

function counts(rows){return Object.fromEntries([...new Set(rows.map(row=>row.level))].sort((a,b)=>a-b).map(level=>[level,rows.filter(row=>row.level===level).length]));}
function unique(rows,label){assert.equal(new Set(rows.map(row=>row.id)).size,rows.length,`${label} contains duplicate spell IDs`);assert.ok(rows.every(row=>row.name&&Number.isInteger(row.level)),`${label} contains incomplete records`);}

test("2014 Ranger spell list is the exact 37-spell SRD catalog",()=>{unique(RANGER_SPELLS_2014,"2014 Ranger");assert.equal(RANGER_SPELLS_2014.length,37);assert.deepEqual(counts(RANGER_SPELLS_2014),{1:11,2:11,3:9,4:4,5:2});assert.ok(RANGER_SPELLS_2014.some(spell=>spell.id==="hunters-mark"));assert.equal(RANGER_SPELLS_2014.some(spell=>spell.id==="ensnaring-strike"),false);});

test("2024 Ranger spell list is the exact 48-spell SRD catalog",()=>{unique(RANGER_SPELLS_2024,"2024 Ranger");assert.equal(RANGER_SPELLS_2024.length,48);assert.deepEqual(counts(RANGER_SPELLS_2024),{1:13,2:15,3:12,4:5,5:3});assert.ok(RANGER_SPELLS_2024.every(spell=>spell.school));for(const id of ["hunters-mark","ensnaring-strike","entangle","revivify","greater-restoration"])assert.ok(RANGER_SPELLS_2024.some(spell=>spell.id===id),`missing ${id}`);});

test("Druidic Warrior is restricted to the exact 11 SRD Druid cantrips",()=>{unique(RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024,"Druidic Warrior");assert.equal(RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.length,11);assert.ok(RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.every(spell=>spell.level===0&&spell.school));assert.deepEqual(RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.map(spell=>spell.name).sort(),["Druidcraft","Elementalism","Guidance","Mending","Message","Poison Spray","Produce Flame","Resistance","Shillelagh","Spare the Dying","Starry Wisp"].sort());});
