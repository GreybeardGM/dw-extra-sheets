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

    // Get Data
    async getData(options) {
      const context = await super.getData(options);
    
      // All items
      const allItems = Array.from(this.actor.items || []);
    
      // Get unique itemTypes actually present
      const typeSet = new Set();
      for (let item of allItems) {
        if (item.system?.itemType) typeSet.add(item.system.itemType);
      }
      context.filterTypes = Array.from(typeSet).sort();

      // Provide Type Labels
      context.typeLabels = {
        weapon: "Weapons",
        armor: "Armor",
        dungeongear: "Gear",
        poison: "Poison",
        meal: "Meal",
        service: "Service",
        transport: "Transport",
        bribe: "Bribe",
        giftsfinery: "Gifts & Finery",
        hoard: "Hoard",
        landbuilding: "Land & Buildings"
      };
      
      // Filtering logic
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
