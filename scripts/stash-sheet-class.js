export function defineStashSheet(baseClass) {
  return class StashSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "stash"];
      options.width = 560;
      options.height = 670;
      options.template = `modules/${game.modules.get("dungeonworld-hirelings")?.id}/templates/stash-sheet.html`;
      return options;
    }

    get template() {
      return "modules/dungeonworld-hirelings/templates/stash-sheet.html";
    }

    // Save filter selection (survives re-render)
    itemFilter = "all";

    async getData(options) {
      const context = await super.getData(options);

      // Get all items, filter only "equipment" type for display
      const allItems = Array.from(this.actor.items || []);
      let itemsToShow;
      if (this.itemFilter === "all") {
        itemsToShow = allItems;
      } else {
        itemsToShow = allItems.filter(i => i.system?.itemType === this.itemFilter);
      }

      context.equipment = itemsToShow;
      context.activeFilter = this.itemFilter;

      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);

      // Item filter radio
      html.find('input[name="itemFilter"]').change(ev => {
        this.itemFilter = ev.currentTarget.value;
        this.render();
      });

      // Usual item controls (edit, delete, etc.) are handled by baseClass
    }
  };
}
