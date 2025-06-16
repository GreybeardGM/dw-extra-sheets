// items.js

/**
 * Prepare/enrich items (add .descriptionEnriched, etc) for a given array.
 * @param {context|Object} context from the getData to manipulate.
 * @param {Actor|Object} actor - The actor, for ownership/rollData.
 */
export async function prepareEquipmentItems(sheetData, actor) {
  // Tag stringification, if needed
  if (sheetData.system.tags != undefined && sheetData.system.tags != '') {
    let tagArray = [];
    try { tagArray = JSON.parse(sheetData.system.tags); }
    catch (e) { tagArray = [sheetData.system.tags]; }
    sheetData.system.tagsString = tagArray.map(item => item.value).join(', ');
  } else {
    sheetData.system.tags = sheetData.system.tagsString;
  }

  const enrichmentOptions = {
    async: true,
    documents: true,
    secrets: actor.isOwner,
    rollData: actor.getRollData(),
  };

  const equipment = [];
  for (let i of sheetData.items) {
    const item = actor.items.get(i._id);
    enrichmentOptions.relativeTo = item;
    enrichmentOptions.rollData = item.getRollData();
    if (i.system?.description) {
      i.system.descriptionEnriched = await TextEditor.enrichHTML(i.system.description, enrichmentOptions);
    }
    i.img = i.img || DEFAULT_TOKEN;
    if (i.type === 'equipment') equipment.push(i);
  }

  sheetData.equipment = equipment;
}
