async _prepareItems(sheetData) {
  const equipment = [];
  // Use this.actor.items instead of sheetData.items
  const itemsArr = this.actor.items ? Array.from(this.actor.items) : [];
  for (let i of itemsArr) {
    if (i.system?.description) {
      i.system.descriptionEnriched = await TextEditor.enrichHTML(i.system.description, {
        async: true,
        documents: true,
        secrets: this.actor.isOwner,
        rollData: this.actor.getRollData(),
      });
    }
    if (i.type === "equipment") equipment.push(i);
  }
  sheetData.equipment = equipment;
}
