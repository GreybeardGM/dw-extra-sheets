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
      const system = this.actor.system;

      system.mount ??= {};
      const mount = system.mount;

      mount.active ??= false;
      mount.species ??= "";
      mount.load ??= { label: game.i18n.localize("DWES.Load"), value: 0, max: 0 };
      mount.load.label ??= game.i18n.localize("DWES.Load");
      mount.load.value ??= 0;
      mount.load.max ??= 0;

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

      await prepareEquipmentItems(context, this.actor);
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
