// items.js

/**
 * Prepare/enrich items (add .descriptionEnriched, etc) for a given array.
 * @param {Actor|Object} actor - The actor, for ownership/rollData.
 * @returns {Promise<Array>} The enriched items (can be used in-place).
 */
export async function prepareEquipmentItems(actor) {
  const equipment = [];
  const itemsArr = actor.items ? Array.from(actor.items) : [];
  for (let i of itemsArr) {
    if (i.system?.description) {
      i.system.descriptionEnriched = await TextEditor.enrichHTML(i.system.description, {
        async: true,
        documents: true,
        secrets: actor.isOwner,
        rollData: actor.getRollData(),
      });
    }
    if (i.type === "equipment") equipment.push(i);
  }
  return equipment;
}
