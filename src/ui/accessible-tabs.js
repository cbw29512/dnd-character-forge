const TAB_SELECTOR="[data-tab]",VIEW_SELECTOR="[data-view]";

export function bindAccessibleTabs({onActivate,root=globalThis.document}={}){
  try{
    if(typeof onActivate!=="function")throw new Error("Accessible tabs require an activation callback.");
    const nav=root?.querySelector?.(".primary-nav"),tabs=Array.from(root?.querySelectorAll?.(TAB_SELECTOR)||[]),views=Array.from(root?.querySelectorAll?.(VIEW_SELECTOR)||[]);
    if(!nav||!tabs.length||!views.length)throw new Error("Forge navigation tabs are unavailable.");
    nav.setAttribute("role","tablist");
    tabs.forEach((tab,index)=>{
      const name=tab.dataset.tab;if(!name)throw new Error("A Forge navigation tab is missing its name.");
      tab.id=`forge-tab-${name}`;tab.setAttribute("role","tab");tab.setAttribute("aria-controls",`forge-panel-${name}`);
      tab.addEventListener("click",()=>onActivate(name));
      tab.addEventListener("keydown",event=>handleTabKey(event,index,tabs,onActivate));
    });
    views.forEach(view=>{const name=view.dataset.view;if(!name)throw new Error("A Forge navigation panel is missing its name.");view.id=`forge-panel-${name}`;view.setAttribute("role","tabpanel");view.setAttribute("aria-labelledby",`forge-tab-${name}`);});
    const active=tabs.find(tab=>tab.classList.contains("is-active"))?.dataset.tab||tabs[0].dataset.tab;
    activateAccessibleTab(active,root);
  }catch(error){console.error("[accessible-tabs] binding failed",error);throw error;}
}

export function activateAccessibleTab(name,root=globalThis.document){
  try{
    const tabs=Array.from(root?.querySelectorAll?.(TAB_SELECTOR)||[]),views=Array.from(root?.querySelectorAll?.(VIEW_SELECTOR)||[]);
    if(!tabs.some(tab=>tab.dataset.tab===name))throw new Error(`Forge navigation tab "${name}" is unavailable.`);
    tabs.forEach(tab=>{const active=tab.dataset.tab===name;tab.classList.toggle("is-active",active);tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;});
    views.forEach(view=>{view.hidden=view.dataset.view!==name;});
    return name;
  }catch(error){console.error("[accessible-tabs] activation failed",error);throw error;}
}

function handleTabKey(event,index,tabs,onActivate){
  try{
    const key=event.key;if(!["ArrowLeft","ArrowRight","Home","End"].includes(key))return;
    event.preventDefault();let next=index;
    if(key==="ArrowLeft")next=(index-1+tabs.length)%tabs.length;
    if(key==="ArrowRight")next=(index+1)%tabs.length;
    if(key==="Home")next=0;if(key==="End")next=tabs.length-1;
    const target=tabs[next];target.focus();onActivate(target.dataset.tab);
  }catch(error){console.error("[accessible-tabs] keyboard navigation failed",error);throw error;}
}
