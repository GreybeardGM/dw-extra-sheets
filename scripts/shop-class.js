import { prepareEquipmentItems } from "./utils/items.js";

export function defineShopSheet(baseClass) {
  return class ShopSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "shop"];
      options.width = 970;
      options.height = 840;
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

      const system = this.actor.system;
      system.shop ??= {};
      system.shop.open ??= false;
      system.shop.notes ??= "";
      system.shop.limitedStock ??= false;
      system.shop.allAccess = game.user.isGM;
      
      context.system = system;  // explizit reinschreiben, obwohl meist schon vorhanden
    
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

      // Zugriff prüfen
      const allAccess = game.user.isGM;
      if (!allAccess) {
        // Dragging deaktivieren
        html.find(".item").each((_, el) => {
          el.draggable = false;
        });
      }
      
      // Buy logic
      html.find(".buy-item").click(async (event) => {
        // Failsafe: Shop geschlossen?
        if (!this.actor.system.shop?.open) {
          ui.notifications.warn("Shop is closed. Please return later.");
          return;
        }
      
        const li = event.currentTarget.closest(".item");
        const itemId = li.dataset.itemId;
        const quantityInput = li.querySelector(".buy-quantity");
        const requestedQty = Math.max(1, parseInt(quantityInput?.value || "1"));
      
        const item = this.actor.items.get(itemId);
        if (!item) return;
      
        const buyer = game.user.character;
        if (!buyer) return ui.notifications.warn("No character selected.");
      
        const shopIsOpen = this.actor.system.shop?.open;
        if (!shopIsOpen) return ui.notifications.warn("Shop closed. Please return later.");
      
        const limitedStock = this.actor.system.shop?.limitedStock;
        const availableQty = Number(item.system.quantity) || 0;
      
        // Check if limited and item is out of stock
        if (limitedStock && availableQty <= 0) {
          return ui.notifications.warn(`${item.name} is out of stock.`);
        }
      
        // Determine how many can be bought
        let actualQty = requestedQty;
        if (limitedStock && requestedQty > availableQty) {
          actualQty = availableQty;
          ui.notifications.info(`Only ${actualQty} ${item.name} available. Adjusted purchase.`);
        }
      
        const price = Number(item.system.price) || 0;
        const totalCost = price * actualQty;
        const buyerCoins = buyer.system.attributes.coin.value ?? 0;
      
        if (buyerCoins < totalCost) {
          return ui.notifications.warn("Not enough coin.");
        }
      
        // Clone item and set quantity
        const itemData = item.toObject();
        itemData.system.quantity = actualQty;
      
        // Add or update item on buyer
        const ownedItem = buyer.items.find(i => i.name === item.name);
        if (ownedItem) {
          const currentQty = ownedItem.system.quantity ?? 1;
          await buyer.updateEmbeddedDocuments("Item", [{
            _id: ownedItem.id,
            "system.quantity": currentQty + actualQty
          }]);
        } else {
          await buyer.createEmbeddedDocuments("Item", [itemData]);
        }
      
        // Deduct coins
        const newCoinValue = buyerCoins - totalCost;
        await buyer.update({ "system.attributes.coin.value": newCoinValue });
      
        // Update UI input manually
        setTimeout(() => {
          for (const app of Object.values(ui.windows)) {
            if (app instanceof ActorSheet && app.actor.id === buyer.id) {
              const input = app.element.find('input[name="system.attributes.coin.value"]');
              if (input.length) input.val(newCoinValue);
            }
          }
        }, 50);
      
        // Reduce stock in shop
        if (limitedStock) {
          const newStockQty = availableQty - actualQty;
          await this.actor.updateEmbeddedDocuments("Item", [{
            _id: item.id,
            "system.quantity": newStockQty
          }]);
        }
      
        ui.notifications.info(`You bought ${actualQty} ${item.name} for ${totalCost} Coin.`);
      });

    }
  };
}
