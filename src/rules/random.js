export function pick(items) {
  try {
    if (!Array.isArray(items) || items.length === 0) throw new Error("Cannot pick from an empty list");
    const eligible = items.filter(item => item?.randomEligible !== false);
    if (eligible.length === 0) throw new Error("Cannot pick from a list with no Random-eligible choices");
    return eligible[Math.floor(Math.random() * eligible.length)];
  } catch (error) { console.error("[random] pick failed", error); throw error; }
}
export function sample(items, count, excluded = []) {
  try {
    const pool = items.filter(item => !excluded.includes(item));
    if (pool.length < count) throw new Error(`Need ${count} choices but only ${pool.length} are available`);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  } catch (error) { console.error("[random] sample failed", error); throw error; }
}
export function roll4d6DropLowest() {
  try {
    const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6)).sort((a,b)=>a-b);
    return rolls.slice(1).reduce((sum, value) => sum + value, 0);
  } catch (error) { console.error("[random] dice roll failed", error); throw error; }
}
