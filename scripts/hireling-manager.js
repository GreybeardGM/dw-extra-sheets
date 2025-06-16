import { useHirelingSkill, resetHirelingSkills } from "./hireling-utils.js";

class HirelingManagerApp extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "hireling-manager",
      template: "modules/dungeonworld-hirelings/templates/hireling-manager.html",
      width: 600,
      height: "auto",
      resizable: true,
      title: "Hirelings Manager"
    });
  }

  getData() {
    // Fetch all active hirelings
    const hirelings = game.actors.filter(a =>
      a.type === "npc" && a.system?.hireling?.active
    );
    return { hirelings };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Spend skill point
    html.find(".hireling-skill").click(async ev => {
      const actorId = ev.currentTarget.dataset.actorId;
      const skillKey = ev.currentTarget.dataset.skillKey;
      const actor = game.actors.get(actorId);
      await useHirelingSkill(actor, skillKey);
      this.render();
    });

    // Reset All
    html.find(".rest-all-hirelings").click(async ev => {
      const hirelings = game.actors.filter(a => a.type === "npc" && a.system?.hireling?.active);
      for (let actor of hirelings) await resetHirelingSkills(actor);
      this.render();
    });
  }
}
