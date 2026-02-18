// Use a skill point
export async function useHirelingSkill(actor, skillKey) {
  const path = `system.hireling.skills.${skillKey}.value`;
  const current = getProperty(actor, path);
  if (typeof current === "number" && current > 0) {
    await actor.update({ [path]: current - 1 });
    return true;
  }
  return false;
}

// Reset all skill points to max
export async function resetHirelingSkills(actor) {
  const updates = {};
  for (let i = 1; i <= 5; i++) {
    const key = `skill${i}`;
    const skill = actor.system.hireling.skills?.[key];
    if (!skill) continue;
    updates[`system.hireling.skills.${key}.value`] = skill.max;
  }
  await actor.update(updates);
}
