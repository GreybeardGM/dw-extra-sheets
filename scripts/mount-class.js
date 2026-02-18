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
      mount.load ??= { label: game.i18n.localize("DWES.Load"), value: 0, max: 0 };
      mount.load.label ??= game.i18n.localize("DWES.Load");
      mount.load.value ??= 0;
      mount.load.max ??= 0;

      context.mount = mount;

      await prepareEquipmentItems(context, this.actor);
      return context;
    }
  };
}
