const SRD_51 = "Contains SRD 5.1 material © Wizards of the Coast LLC · CC BY 4.0 · dnd.wizards.com/resources/systems-reference-document · creativecommons.org/licenses/by/4.0/";
const SRD_521 = "Contains SRD 5.2.1 material © Wizards of the Coast LLC · CC BY 4.0 · dndbeyond.com/srd · creativecommons.org/licenses/by/4.0/";

export function printLicenseAttribution(model){
  try{
    const version=String(model?.audit?.version||"");
    if(version.includes("5.2.1"))return SRD_521;
    if(version.includes("5.1"))return SRD_51;
    return "Character Forge · Independent project · Source/license provenance is recorded in the Rules Audit.";
  }catch(error){
    console.error("[print-license] attribution resolution failed",error);
    throw error;
  }
}
