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
    
      // === Initialize blank hireling structure if missing ===
      system.hireling ??= {};

      // === Prepare Hireling Stats ===
      const h = system.hireling;    
      h.loyalty ??= { value: 0, cost: "" };
      h.skills ??= {};
      for (let i = 1; i <= 5; i++) {
        h.skills[`skill${i}`] ??= { label: "", value: 0, max: 0 };
      }
      h.active ??= false;
      h.rank ??= 0;
      h.hirelingClass ??= "";
    
      context.loyalty = [h.loyalty.value, h.loyalty.cost];
      context.skills = [
        h.skills.skill1,
        h.skills.skill2,
        h.skills.skill3,
        h.skills.skill4,
        h.skills.skill5,
      ];
      context.active = h.active;
      context.rank = h.rank;
      context.hirelingClass = h.hirelingClass;

      await prepareEquipmentItems(context, this.actor);
      
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
    
      let resultType, resultLabel, resultText;
      if (roll.total >= 10) {
        resultType = "success";
        resultLabel = "Success";
        resultText = "They stand firm and carry out the order.";
      } else if (roll.total >= 7) {
        resultType = "partial";
        resultLabel = "Partial Success";
        resultText = "They do it for now, but come back with serious demands later. Meet them or the hireling quits on the worst terms.";
      } else {
        resultType = "failure";
        resultLabel = "Failure";
        resultText = "They refuse, panic, or make things worse.";
      }
    
      const flavor = `
        <section class="dw-chat-card">
          <div class="cell cell--chat dw chat-card move-card">
            <div class="chat-title row flexrow">
              <img class="item-icon" src="icons/skills/social/thumbsup-approval-like.webp" alt="Order Hirelings"/>
              <h2 class="cell__title">Order Hirelings</h2>
            </div>
            <div class="row"><strong>Trigger:</strong> When a hireling finds themselves in a dangerous, degrading, or just flat-out crazy situation due to your orders, <b>roll +Loyalty</b>.</div>
            <div class="row result ${resultType}">
              <div class="result-label">${resultLabel}</div>
              <div class="result-details">${resultText}</div>
            </div>
          </div>
        </section>
      `;
    
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: flavor,
        sound: CONFIG.sounds.dice
        // You can add flags or whisper here as well
      });
    }

  };
}
