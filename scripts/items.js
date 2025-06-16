// items.js

/**
 * Prepare/enrich items (add .descriptionEnriched, etc) for a given array.
 * @param {context|Object} context from the getData to manipulate.
 * @param {Actor|Object} actor - The actor, for ownership/rollData.
 */
export async function prepareEquipmentItems(context, actor) {
  const actorData = actor.toObject(false);
  context.actor = actorData;
  context.system = actorData.system;
  context.items = actorData.items ?? [];
  context.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  for (let i of context.items) {
    const item = this.actor.items.get(i._id);
    if (item) i.labels = item.labels;
  }
    
  // Tag stringification, if needed
  if (context.system.tags != undefined && context.system.tags != '') {
    let tagArray = [];
    try { tagArray = JSON.parse(context.system.tags); }
    catch (e) { tagArray = [context.system.tags]; }
    context.system.tagsString = tagArray.map(item => item.value).join(', ');
  } else {
    context.system.tags = context.system.tagsString;
  }

  const enrichmentOptions = {
    async: true,
    documents: true,
    secrets: actor.isOwner,
    rollData: actor.getRollData(),
  };

  const equipment = [];
  for (let i of context.items) {
    const item = actor.items.get(i._id);
    enrichmentOptions.relativeTo = item;
    enrichmentOptions.rollData = item.getRollData();
    if (i.system?.description) {
      i.system.descriptionEnriched = await TextEditor.enrichHTML(i.system.description, enrichmentOptions);
    }
    i.img = i.img || DEFAULT_TOKEN;
    if (i.type === 'equipment') equipment.push(i);
  }

  context.equipment = equipment;
}
