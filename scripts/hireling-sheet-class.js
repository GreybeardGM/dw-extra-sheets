// hireling-sheet-class.js
export function createHirelingSheet(BaseSheet) {
  return class HirelingSheet extends BaseSheet {
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.classes = [...options.classes, "hireling"];
      options.width = 560;
      options.height = 600;
      options.template = "modules/dungeonworld-hirelings/templates/hireling-sheet.html";
      options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }];
      return options;
    }

    async getData(options) {
      const context = await super.getData(options);
      const system = this.actor.system;
      context.system.loyalty = system.loyalty;
      context.skills = [
        system.skills.skill1,
        system.skills.skill2,
        system.skills.skill3,
        system.skills.skill4,
        system.skills.skill5,
      ];
      return context;
    }

    activateListeners(html) {
      super.activateListeners(html);
      if (!this.options.editable) return;

      html.find(".skill-use").click(async ev => {
        ev.preventDefault();
        const idx = ev.currentTarget.dataset.skill;
        const path = `system.skills.skill${idx}.value`;
        const current = getProperty(this.actor, path);
        if (typeof current === "number" && current > 0) {
          await this.actor.update({ [path]: current - 1 });
        }
      });

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

      html.find(".loyalty-roll").click(async ev => {
        ev.preventDefault();
        const loyalty = this.actor.system.loyalty?.value || 0;
        const roll = new Roll("2d6 + @loyalty", { loyalty });
        await roll.roll({ async: true });
        roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: "Loyalty Check" });
      });
    }
  };
}
