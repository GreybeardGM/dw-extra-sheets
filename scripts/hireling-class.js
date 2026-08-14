import { prepareEquipmentItems } from "./utils/items.js";
import { useHirelingSkill, resetHirelingSkills } from "./utils/hireling-utils.js";

export function defineHirelingSheet(baseClass) {
  return class HirelingSheet extends baseClass {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "hireling"];
      options.width = 560;
      options.height = 730;
      options.template = `modules/dw-extra-sheets/templates/hireling-sheet.html`;
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    // Change the Template
    get template() {
      return "modules/dw-extra-sheets/templates/hireling-sheet.html";
    }

    // Get Data
    async getData(options) {
      const context = await super.getData(options);
      const system = this.actor.system;

      await prepareEquipmentItems(context, this.actor);
    
      // === Initialize blank hireling structure if missing ===
      system.hireling ??= {};

      // === Prepare Hireling Stats ===
      const h = system.hireling;    
      h.loyalty ??= { value: 0, cost: "" };
      h.skills ??= {};
      for (let i = 1; i <= 5; i++) {
        h.skills[`skill${i}`] ??= { label: "", value: 0, max: 0 };
      }
      h.weight ??= {};
      h.weight.showWeight ??= false;
      h.weight.max ??= 0;
      h.weight.label = game.i18n.localize("DWES.Weight");

      h.weight.value = Number(context.weight?.value ?? 0);
      const weightMax = Number(h.weight.max ?? 0);
      const weightValue = Number(h.weight.value ?? 0);
      h.weight.encumbered = weightValue > weightMax;
      h.weight.overencumbered = weightValue > weightMax + 2;

      h.active ??= false;
      h.rank ??= 0;
      h.hirelingClass ??= "";

      const hirelingSkills = [];
      for (let i = 1; i <= 5; i++) {
        const key = `skill${i}`;
        hirelingSkills.push({ key, ...h.skills[key] });
      }

      context.loyalty = [h.loyalty.value, h.loyalty.cost];
      context.skills = hirelingSkills;
      context.hirelingWeight = h.weight;
      context.active = h.active;
      context.rank = h.rank;
      context.hirelingClass = h.hirelingClass;

      return context;
    }

    // Listeners
    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      // Loyalty Roll
      html.find(".hireling-loyalty-roll").click(ev => {
        ev.preventDefault();
        this._rollHirelingLoyalty();
      });
      
      // Config button
      html.find(".skill-configure").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = true;
        this.render();
      });
      // Config done    
      html.find(".skill-done").click(ev => {
        ev.preventDefault();
        this.options.configureSkills = false;
        this.render();
      });

      // Use a Skill Point
      html.find(".skill-use").click(async ev => {
        ev.preventDefault();
        const idx = ev.currentTarget.dataset.skill;
        await useHirelingSkill(this.actor, idx);
        this.render();
      });
      
      // Reset Skill Points
      html.find(".skill-reset").click(async ev => {
        ev.preventDefault();
        await resetHirelingSkills(this.actor);
        this.render();
      });
    }

    // Loyalty Roll
    async _rollHirelingLoyalty() {
      const actor = this.actor;
      const loyalty = actor.system.hireling.loyalty?.value ?? 0;
      const roll = new Roll("2d6 + @loyalty", { loyalty });
      await roll.evaluate({ async: true });

      const resultEntry = Object.entries(CONFIG.DW.rollResults).find(([, range]) => {
        const meetsStart = range.start == null || roll.total >= range.start;
        const meetsEnd = range.end == null || roll.total <= range.end;
        return meetsStart && meetsEnd;
      });

      if (!resultEntry) {
        ui.notifications.error("No Dungeon World roll result matches this total.");
        return;
      }

      const [resultType, resultRange] = resultEntry;
      const resultDetails = {
        success: "They stand firm and carry out the order.",
        partial: "They do it for now, but come back with serious demands later. Meet them or the hireling quits on the worst terms.",
        failure: "They refuse, panic, or make things worse."
      }[resultType] ?? "";

      const templateData = {
        actor,
        image: "icons/skills/social/thumbsup-approval-like.webp",
        title: "Order Hirelings",
        trigger: "When a hireling finds themselves in a dangerous, degrading, or just flat-out crazy situation due to your orders, roll +Loyalty.",
        result: resultType,
        resultLabel: game.i18n.localize(resultRange.label ?? resultType),
        resultDetails,
        roll,
        rollDw: await roll.render()
      };

      const template = "systems/dungeonworld/templates/chat/chat-move.html";
      const { renderTemplate } = foundry.applications.handlebars;
      const content = await renderTemplate(template, templateData);
      const chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor }),
        content
      };

      const rollMode = game.settings.get("core", "rollMode");
      if (["gmroll", "blindroll"].includes(rollMode)) {
        chatData.whisper = ChatMessage.getWhisperRecipients("GM");
      }
      if (rollMode === "selfroll") chatData.whisper = [game.user.id];
      if (rollMode === "blindroll") chatData.blind = true;

      if (game.dice3d) {
        await game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind);
      } else {
        chatData.sound = CONFIG.sounds.dice;
      }

      await ChatMessage.create(chatData);
    }

  };
}
