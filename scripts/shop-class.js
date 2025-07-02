import { prepareEquipmentItems } from "./utils/items.js";

export function defineShopSheet(baseClass) {
  return class ShopSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "shop"];
      options.width = 640;
      options.height = 670;
      options.template = `modules/dw-extra-sheets/templates/shop-sheet.html`;
      return options;
    }

    get template() {
      return "modules/dw-extra-sheets/templates/shop-sheet.html";
    }

    // Save filter selection (survives re-render)
    itemFilter = "all";

    // Get Data
    async getData(options) {
      const context = await super.getData(options);

      const existingShop = context.system.shop ?? {};
      context.system = {
        ...context.system,
        shop: {
          ...existingShop,
          open: existingShop.open ?? false,
          allAccess: game.user.isGM
        }
      };
    
      // Get and Prep all items
      await prepareEquipmentItems(context, this.actor);
      const allItems = context.equipment;
    
      // Get unique itemTypes actually present and sort them
      const ITEM_TYPE_ORDER = [
        "weapon", "armor", "dungeongear", "poison", "meal",
        "service", "transport", "bribe", "giftsfinery", "hoard", "landbuilding"
      ];
      const typeSet = new Set();
      for (let item of allItems) {
        if (item.system?.itemType) typeSet.add(item.system.itemType);
      }
      const filterTypes = Array.from(typeSet);
      filterTypes.sort((a, b) => ITEM_TYPE_ORDER.indexOf(a) - ITEM_TYPE_ORDER.indexOf(b));
      context.filterTypes = filterTypes;

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
      context.typeIcons = {
        weapon: "fa-sword",
        armor: "fa-shield-alt",
        dungeongear: "fa-tools",
        poison: "fa-flask",
        meal: "fa-drumstick-bite",
        service: "fa-hands-helping",
        transport: "fa-horse-head",
        bribe: "fa-coins",
        giftsfinery: "fa-gem",
        hoard: "fa-treasure-chest",
        landbuilding: "fa-home"
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

      // Buy logic
      html.find(".buy-item").click(async (event) => {
        const li = event.currentTarget.closest(".item");
        const itemId = li.dataset.itemId;
        const quantity = parseInt(li.querySelector(".buy-quantity").value || "1");
      
        const item = this.actor.items.get(itemId);
        if (!item) return;
      
        const buyer = game.user.character;
        if (!buyer) return ui.notifications.warn("No character selected.");
      
        // Preis überprüfen
        const price = Number(item.system.price) || 0;
        const totalCost = price * quantity;
        const buyerCoins = buyer.system.attributes.coin.value ?? 0;
        
        if (buyerCoins < totalCost) {
          return ui.notifications.warn("Not enough coin.");
        }
        
        const itemData = item.toObject();
        itemData.system.quantity = quantity;
        
        // Prüfen, ob der Käufer das Item schon hat (per Name vergleichen)
        const ownedItem = buyer.items.find(i => i.name === item.name);
        
        // Wenn vorhanden: quantity erhöhen
        if (ownedItem) {
          const currentQty = ownedItem.system.quantity ?? 1;
          await buyer.updateEmbeddedDocuments("Item", [{
            _id: ownedItem.id,
            "system.quantity": currentQty + quantity
          }]);
        } else {
          // Neu erstellen
          await buyer.createEmbeddedDocuments("Item", [itemData]);
        }

        // Coin abziehen
        const newCoinValue = buyerCoins - totalCost;
        await buyer.update({ "system.attributes.coin.value": newCoinValue });
        
        setTimeout(() => {
          for (const app of Object.values(ui.windows)) {
            if (app instanceof ActorSheet && app.actor.id === buyer.id) {
              const input = app.element.find('input[name="system.attributes.coin.value"]');
              if (input.length) input.val(newCoinValue);
            }
          }
        }, 50);
        
        ui.notifications.info(`You spent ${totalCost} Coin.`);
        // Optional: Item aus Shop entfernen
        // await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      });

    }
  };
}
