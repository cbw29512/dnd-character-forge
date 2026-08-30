export const FORGE_BUILD=Object.freeze({
  id:"CF-2026.08.29-RLC1",
  label:"Rules Lawyer Certification v1",
  version:"2026.08.29.1"
});

export function buildRulesLawyerCertification(character){
  try{
    if(!character?.validation?.valid)throw new Error("Rules Lawyer certification requires a validated character.");
    const audit=character.audit;
    if(!audit||audit.status!=="PASS")throw new Error("Rules Lawyer certification requires a passing Rules Audit.");
    const rawCertified=audit.sourceMode==="RAW"&&audit.rawIntegrity===true;
    const forgeOriginal=!rawCertified&&audit.sourceMode==="RAW"&&String(audit.license||"").includes("Character Forge Original");
    const status=rawCertified?"RULES LAWYER CERTIFIED":forgeOriginal?"AUDITED 5E COMPATIBLE":"AUDITED CUSTOM CONTENT";
    return Object.freeze({
      status,
      rawCertified,
      forgeOriginal,
      buildId:FORGE_BUILD.id,
      forgeVersion:FORGE_BUILD.version,
      certificationVersion:FORGE_BUILD.label,
      sourceVersion:audit.sourceVersion,
      rulesLabel:audit.rulesLabel,
      sourceMode:audit.sourceMode,
      mechanicCount:(audit.mechanics||[]).length,
      checkCount:(audit.checks||[]).length,
      provenanceComplete:(audit.mechanics||[]).every(item=>Boolean(item?.source?.version&&item?.source?.page))
    });
  }catch(error){console.error("[certification] build failed",error);throw error;}
}

export function certificationFooterText(character){
  try{
    const certification=buildRulesLawyerCertification(character);
    return `${certification.rawCertified?"⚖":"✓"} ${certification.status} · ${certification.buildId}`;
  }catch(error){console.error("[certification] footer failed",error);throw error;}
}
