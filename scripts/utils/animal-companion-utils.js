// Use a skill point
export async function useAnimalCompanionSkill(actor, skillKey) {
  const path = `system.animalCompanion.skills.${skillKey}.value`;
  const current = getProperty(actor, path);
  if (typeof current === "number" && current > 0) {
    await actor.update({ [path]: current - 1 });
    return true;
  }
  return false;
}

// Reset all skill points to max
export async function resetAnimalCompanionSkills(actor) {
  const updates = {};
  for (let [key, skill] of Object.entries(actor.system.animalCompanion.skills || {})) {
    updates[`system.animalCompanion.skills.${key}.value`] = skill.max;
  }
  await actor.update(updates);
}
