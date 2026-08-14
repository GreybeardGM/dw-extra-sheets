import { prepareEquipmentItems } from "./utils/items.js";

export function defineMountSheet(baseClass) {
  return class MountSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "mount"];
      options.width = 560;
      options.height = 730;
      options.template = "modules/dw-extra-sheets/templates/mount-sheet.html";
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    get template() {
      return "modules/dw-extra-sheets/templates/mount-sheet.html";
    }

    async getData(options) {
      const context = await super.getData(options);

      await prepareEquipmentItems(context, this.actor);

      context.system.mount ??= {};
      const mount = context.system.mount;

      mount.active ??= false;
      mount.species ??= "";
      mount.weight ??= { label: game.i18n.localize("DWES.Weight"), value: 0, max: 0 };
      mount.weight.label ??= game.i18n.localize("DWES.Weight");
      mount.weight.max ??= 0;

      mount.weight.value = Number(context.weight?.value ?? 0);
      const weightMax = Number(mount.weight.max ?? 0);
      const weightValue = Number(mount.weight.value ?? 0);
      mount.weight.encumbered = weightValue > weightMax;
      mount.weight.overencumbered = weightValue > weightMax + 2;

      mount.owner ??= {};
      mount.owner.UUID ??= "";
      if (mount.owner.UUID) {
        try {
          const ownerActor = await fromUuid(mount.owner.UUID);
          if (ownerActor?.name && ownerActor?.img) {
            mount.owner.name = ownerActor.name;
            mount.owner.img = ownerActor.img;
          }
        } catch (e) {
          console.warn("Invalid owner UUID on mount:", mount.owner);
        }
      }

      context.mount = mount;

      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      html.find(".set-owner-button").click(async (ev) => {
        ev.preventDefault();
        const char = game.user.character;
        if (!char) {
          ui.notifications.warn("You don't have an assigned character.");
          return;
        }
        await this.actor.update({ "system.mount.owner.UUID": char.uuid });
        this.render();
      });
    }
  };
}
