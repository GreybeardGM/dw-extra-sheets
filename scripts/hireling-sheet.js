Hooks.once("ready", async function () {
  const npcSheets = CONFIG.Actor.sheetClasses["npc"];
  const dwEntry = Object.entries(npcSheets).find(([key, value]) => {
    return value.cls?.name === "DwActorNpcSheet";
  });

  const DwActorSheet = dwEntry?.[1]?.cls;

  if (!DwActorSheet) {
    console.error("Dungeon World NPC sheet not found");
    return;
  }
  
  class HirelingSheet extends DwActorSheet {

    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "hireling"];
      options.width = 560;
      options.height = 600;
      options.template = `modules/${game.modules.get("dungeonworld-hirelings")?.id}/templates/hireling-sheet.html`;
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }
  
    /** @inheritdoc */
    async getData(options) {
      const context = await super.getData(options);
  
      // Add loyalty value and skills directly from system
      const system = this.actor.system;
      context.system.loyalty = system.loyalty;
  
      // Inject skills as fixed list
      context.skills = [
        system.skills.skill1,
        system.skills.skill2,
        system.skills.skill3,
        system.skills.skill4,
        system.skills.skill5,
      ];
  
      return context;
    }
  
    /** @inheritdoc */
    activateListeners(html) {
      super.activateListeners(html);
  
      if (!this.options.editable) return;
  
      // Skill use buttons - decrement skill value if greater than 0
      html.find(".skill-use").click(async ev => {
        ev.preventDefault();
        const idx = ev.currentTarget.dataset.skill;
        const path = `system.skills.skill${idx}.value`;
        const current = getProperty(this.actor, path);
        if (typeof current === "number" && current > 0) {
          await this.actor.update({ [path]: current - 1 });
        }
      });
  
      // Skill reset button - reset all skills to their max
      html.find(".skill-reset").click(async ev => {
        ev.preventDefault();
        const updates = {};
        for (let i = 1; i <= 5; i++) {
          const skill = this.actor.system.skills[`skill${i}`];
          if (skill && typeof skill.max === "number") {
            updates[`system.skills.skill${i}.value`] = skill.max;
          }
        }
        await this.actor.update(updates);
      });
  
      // Loyalty check button
      html.find(".loyalty-roll").click(async ev => {
        ev.preventDefault();
        const loyalty = this.actor.system.loyalty?.value || 0;
        const roll = new Roll("2d6 + @loyalty", { loyalty });
        await roll.roll({ async: true });
        roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: "Loyalty Check" });
      });
    }
  }

  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });

  console.log("Hireling sheet registered via deferred hook.");
});

