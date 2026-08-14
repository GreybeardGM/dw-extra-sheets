import { prepareEquipmentItems, sortItemTypes } from "./utils/items.js";

function resolvePurchaseQuantity({ requestedQty, limitedStock, availableQty, itemName }) {
  if (limitedStock && requestedQty > availableQty) {
    ui.notifications.info(`Only ${availableQty} ${itemName} available. Adjusted purchase.`);
    return availableQty;
  }

  return requestedQty;
}

async function applyPurchaseToBuyer({ buyer, item, quantity, totalCost, buyerCoins }) {
  const itemData = item.toObject();
  itemData.system.quantity = quantity;

  const ownedItem = buyer.items.find(i => i.name === item.name);
  if (ownedItem) {
    const currentQty = Number(ownedItem.system.quantity) || 0;
    await buyer.updateEmbeddedDocuments("Item", [{
      _id: ownedItem.id,
      "system.quantity": currentQty + quantity
    }]);
  } else {
    await buyer.createEmbeddedDocuments("Item", [itemData]);
  }

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
}

async function decrementShopStock({ shopActor, itemId, limitedStock, availableQty, purchasedQty }) {
  if (!limitedStock) return;

  const newStockQty = availableQty - purchasedQty;
  await shopActor.updateEmbeddedDocuments("Item", [{
    _id: itemId,
    "system.quantity": newStockQty
  }]);
}

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
      const typeSet = new Set();
      for (let item of allItems) {
        if (item.system?.itemType) typeSet.add(item.system.itemType);
      }
      const filterTypes = sortItemTypes(Array.from(typeSet));
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
        if (!this.actor.system.shop?.open) return ui.notifications.warn("Shop is closed. Please return later.");

        const li = event.currentTarget.closest(".item");
        const itemId = li?.dataset?.itemId;
        if (!itemId) return ui.notifications.warn("No item selected.");

        const item = this.actor.items.get(itemId);
        if (!item) return ui.notifications.warn("Item no longer available.");

        const buyer = game.user.character;
        if (!buyer) return ui.notifications.warn("No character selected.");

        const quantityInput = li.querySelector(".buy-quantity");
        const parsedQty = Number.parseInt(quantityInput?.value || "1", 10);
        if (!Number.isFinite(parsedQty) || parsedQty < 1) {
          return ui.notifications.warn("Invalid quantity.");
        }
        const requestedQty = parsedQty;

        const limitedStock = this.actor.system.shop?.limitedStock;
        const availableQty = Number(item.system.quantity) || 0;
      
        // Check if limited and item is out of stock
        if (limitedStock && availableQty <= 0) {
          return ui.notifications.warn(`${item.name} is out of stock.`);
        }
      
        const actualQty = resolvePurchaseQuantity({
          requestedQty,
          limitedStock,
          availableQty,
          itemName: item.name
        });

        if (actualQty < 1) return ui.notifications.warn("No stock available.");

        const price = Number(item.system.price) || 0;
        const totalCost = price * actualQty;
        const buyerCoins = buyer.system.attributes.coin.value ?? 0;

        if (buyerCoins < totalCost) return ui.notifications.warn("Not enough coin.");

        await applyPurchaseToBuyer({
          buyer,
          item,
          quantity: actualQty,
          totalCost,
          buyerCoins
        });

        await decrementShopStock({
          shopActor: this.actor,
          itemId: item.id,
          limitedStock,
          availableQty,
          purchasedQty: actualQty
        });

        ui.notifications.info(`You bought ${actualQty} ${item.name} for ${totalCost} Coin.`);
      });

    }
  };
}
