import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PREFS, loadDashboardPrefs } from "./dashboardPrefs";

const KEY = "cal-dashboard-prefs";

function store(value: unknown) {
  (globalThis as { window?: unknown }).window = {
    localStorage: { getItem: () => JSON.stringify(value) },
  };
}

describe("dashboard prefs saved before a widget existed", () => {
  beforeEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  test("shows the latest transactions widget even when the saved order predates it", () => {
    store({ ...DEFAULT_PREFS, widgetOrder: ["portfolio", "quickLinks", "aspi"] });
    assert.ok(loadDashboardPrefs().widgetOrder.includes("transactions"));
  });

  test("keeps the saved order for widgets the user already arranged", () => {
    store({ ...DEFAULT_PREFS, widgetOrder: ["aspi", "portfolio", "quickLinks"] });
    const prefs = loadDashboardPrefs();
    assert.deepEqual(prefs.widgetOrder.slice(0, 3), ["aspi", "portfolio", "quickLinks"]);
    assert.equal(prefs.widgetOrder.filter((id) => id !== "aspi" && id !== "portfolio" && id !== "quickLinks").length, DEFAULT_PREFS.widgetOrder.length - 3);
  });

  test("drops saved ids that no longer exist", () => {
    store({ ...DEFAULT_PREFS, widgetOrder: ["carousel", "portfolio"], hiddenWidgets: ["carousel"] });
    const prefs = loadDashboardPrefs();
    assert.ok(!prefs.widgetOrder.includes("carousel" as never));
    assert.equal(prefs.hiddenWidgets.length, 0);
  });
});
