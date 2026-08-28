export function sanitizeActiveClassChoiceFields(selections={},fields=[]){
  try{
    const next=structuredClone(selections||{}),byKey=new Map();
    for(const field of fields||[]){
      if(!field?.key||!["single","multi","indexed"].includes(field.type))continue;
      if(!byKey.has(field.key))byKey.set(field.key,[]);
      byKey.get(field.key).push(field);
    }

    for(const [key,group] of byKey){
      const first=group[0];
      if(first.type==="single"){
        const value=next[key],legal=new Set(first.options?.map(option=>option.id)||[]);
        if(value!=null&&value!==""&&!legal.has(value))delete next[key];
        continue;
      }

      if(first.type==="multi"){
        if(!Array.isArray(next[key])){delete next[key];continue;}
        const legal=new Set(first.options?.map(option=>option.id)||[]),limit=Math.max(0,Number(first.max)||0),clean=[];
        for(const value of next[key])if(legal.has(value)&&!clean.includes(value)&&clean.length<limit)clean.push(value);
        if(clean.length)next[key]=clean;else delete next[key];
        continue;
      }

      if(first.type==="indexed"){
        if(!Array.isArray(next[key])){delete next[key];continue;}
        const maxIndex=Math.max(...group.map(field=>Number(field.index)).filter(Number.isInteger)),clean=next[key].slice(0,maxIndex+1);
        for(const field of group){
          const index=Number(field.index),value=clean[index],legal=new Set(field.options?.map(option=>option.id)||[]);
          if(value&&!legal.has(value))clean[index]=null;
        }
        while(clean.length&&clean.at(-1)==null)clean.pop();
        if(clean.length)next[key]=clean;else delete next[key];
      }
    }
    return next;
  }catch(error){console.error("[class-choice-sanitizer] active-field cleanup failed",error);throw error;}
}
