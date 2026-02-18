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
    const item = actor.items.get(i._id);
    if (item) i.labels = item.labels;
  }

  // Tag stringification
  if (context.system.tags != undefined && context.system.tags !== "") {
    let tagArray = [];
    try { tagArray = JSON.parse(context.system.tags); }
    catch (e) { tagArray = [context.system.tags]; }
    context.system.tagsString = tagArray.map(t => t?.value ?? String(t)).join(", ");
  } else {
    context.system.tagsString = context.system.tagsString ?? "";
  }

  // Foundry V13+: TextEditor is namespaced; fallback keeps V12 working.
  const RichText =
    foundry?.applications?.ux?.TextEditor?.implementation
    ?? globalThis.TextEditor;

  const enrichmentOptions = {
    async: true,
    documents: true,
    secrets: actor.isOwner,
    rollData: actor.getRollData(),
  };

  const equipment = [];
  for (let i of context.items) {
    const item = actor.items.get(i._id);
    enrichmentOptions.relativeTo = item ?? null;
    enrichmentOptions.rollData = item?.getRollData?.() ?? actor.getRollData();

    if (i.system?.description && RichText?.enrichHTML) {
      i.system.descriptionEnriched = await RichText.enrichHTML(i.system.description, enrichmentOptions);
    }

    // Robust default image (V10–V13+)
    i.img = i.img || CONFIG?.Token?.defaults?.texture?.src || "icons/svg/item-bag.svg";

    if (i.type === "equipment") equipment.push(i);
  }

  context.equipment = equipment;
}

const ITEM_TYPE_ORDER = [
  "weapon", "armor", "dungeongear", "poison", "meal",
  "service", "transport", "bribe", "giftsfinery", "hoard", "landbuilding"
];

function getTypeRank(itemType) {
  const rank = ITEM_TYPE_ORDER.indexOf(itemType);
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
}

export function sortItemTypes(itemTypes) {
  return [...itemTypes].sort((a, b) => {
    const rankDiff = getTypeRank(a) - getTypeRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.localeCompare(b);
  });
}
