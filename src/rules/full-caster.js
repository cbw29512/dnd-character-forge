const FULL_CASTER_SLOTS=Object.freeze({
  1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},
  6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},
  9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},
  11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},
  13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},
  15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},
  17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},
  18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},
  19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},
  20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}
});

export function fullCasterSlots(level){
  try{const numeric=validatedLevel(level),slots=FULL_CASTER_SLOTS[numeric];return Object.freeze({...slots});}
  catch(error){console.error("[full-caster] slot lookup failed",error);throw error;}
}

export function maxFullCasterSpellLevel(level){
  try{return Math.max(...Object.keys(fullCasterSlots(level)).map(Number));}
  catch(error){console.error("[full-caster] max spell level failed",error);throw error;}
}

export function fullCasterCantrips(level){
  try{const numeric=validatedLevel(level);return numeric<=3?3:numeric<=9?4:5;}
  catch(error){console.error("[full-caster] cantrip progression failed",error);throw error;}
}

export function validatedCasterLevel(level){return validatedLevel(level);}
function validatedLevel(level){const numeric=Number(level);if(!Number.isInteger(numeric)||numeric<1||numeric>20)throw new Error(`Full-caster level must be an integer from 1 to 20: ${level}`);return numeric;}

export const FULL_CASTER_TABLE=FULL_CASTER_SLOTS;
