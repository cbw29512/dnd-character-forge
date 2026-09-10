import test from "node:test";
import assert from "node:assert/strict";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { dossierArtCoverage, supportedDossierVariantCatalog } from "../src/print/dossier-art-coverage.js";
import { curatedDossierPortraitFor } from "../src/print/dossier-portrait-assets.js";

test("dossier art coverage is derived from production catalogs and audits every legal visual variant",()=>{
  try{
    const catalog=supportedDossierVariantCatalog(),coverage=dossierArtCoverage();
    assert.equal(coverage.total,catalog.length);
    assert.equal(new Set(catalog.map(item=>item.variantKey)).size,catalog.length);
    assert.ok(catalog.every(item=>item.rulesets.length>=1));
    assert.ok(catalog.some(item=>item.variantKey==="grave-warden--oath-beacon"));
    assert.equal(coverage.exactIds.includes("grave-warden--oath-beacon"),true);
    assert.equal(coverage.exact,coverage.exactIds.length);
    assert.equal(coverage.exact,1);
    assert.equal(coverage.composed,0);
    assert.equal(coverage.fallback,coverage.total-coverage.exact-coverage.composed);
    assert.deepEqual(coverage.invalid,[]);
    assert.deepEqual(coverage.orphaned,[]);
    assert.ok(coverage.exactIds.every(id=>Boolean(curatedDossierPortraitFor(id))),"exact coverage must count only approved resolver-valid portraits");
    console.info(`[dossier-art-coverage] ${coverage.exact}/${coverage.total} exact curated variants; ${coverage.fallback} safe fallbacks.`);
  }catch(error){
    console.error("[dossier-art-coverage-test] coverage audit failed",error);
    throw error;
  }
});

test("catalog only emits edition-legal background and path combinations",()=>{
  try{
    const dataByRuleset={"2014":FORGE_2014,"2024":FORGE_2024};
    for(const item of supportedDossierVariantCatalog())for(const ruleset of item.rulesets){
      const data=dataByRuleset[ruleset];
      assert.ok(data.backgrounds.some(bg=>bg.id===item.backgroundId),`${item.variantKey} missing ${ruleset} background`);
      if(item.kind==="class"){
        const cls=data.classes.find(value=>value.id===item.classId);
        assert.ok(cls&&Number(cls.subclassLevel)>1,`${item.variantKey} illegal ${ruleset} class-only variant`);
        assert.equal(item.pathId,item.classId,`${item.variantKey} class-only path must resolve to its class`);
      }else{
        assert.equal(item.kind,"subclass",`${item.variantKey} has unknown path kind ${item.kind}`);
        assert.ok(data.subclasses.some(sub=>sub.id===item.pathId&&sub.classId===item.classId),`${item.variantKey} illegal ${ruleset} subclass variant`);
      }
    }
  }catch(error){
    console.error("[dossier-art-coverage-test] legal-catalog audit failed",error);
    throw error;
  }
});
