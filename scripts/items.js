// items.js

/**
 * Prepare/enrich items (add .descriptionEnriched, etc) for a given array.
 * @param {Array} items - The items to process.
 * @param {Actor|Object} actor - The actor, for ownership/rollData.
 * @returns {Promise<Array>} The enriched items (can be used in-place).
 */
export async function prepareItems(items, actor) {
  for (let item of items) {
    if (item.system?.description) {
      item.system.descriptionEnriched = await TextEditor.enrichHTML(item.system.description, {
        async: true,
        documents: true,
        secrets: actor.isOwner,
        rollData: actor.getRollData(),
      });
    }
  }
  return items;
}
