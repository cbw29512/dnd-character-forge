const SRD_51 = "This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.";
const SRD_521 = "This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.";

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
