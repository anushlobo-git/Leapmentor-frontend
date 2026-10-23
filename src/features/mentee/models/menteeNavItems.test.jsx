import { MENTEE_NAV_ITEMS } from "./menteeNavItems";

describe("menteeNavItems", () => {
  it("defines nav items with expected keys and labels", () => {
    expect(MENTEE_NAV_ITEMS).toHaveLength(6);
    expect(MENTEE_NAV_ITEMS[0]).toEqual(
      expect.objectContaining({ key: "home", label: "Home" }),
    );
    expect(MENTEE_NAV_ITEMS[1]).toEqual(
      expect.objectContaining({ key: "profile", label: "Profile" }),
    );
    expect(MENTEE_NAV_ITEMS[2]).toEqual(
      expect.objectContaining({ key: "findMentors", label: "Find Mentors" }),
    );
    expect(MENTEE_NAV_ITEMS[3]).toEqual(
      expect.objectContaining({ key: "notifications", label: "Notifications" }),
    );
    expect(MENTEE_NAV_ITEMS[4]).toEqual(
      expect.objectContaining({ key: "history", label: "History" }),
    );
    expect(MENTEE_NAV_ITEMS[5]).toEqual(
      expect.objectContaining({ key: "connects", label: "Connects" }),
    );
  });

  it("defines React elements for icons", () => {
    MENTEE_NAV_ITEMS.forEach((item) => {
      expect(item.icon).toBeDefined();
      expect(typeof item.icon).toBe("object"); // React element is an object
    });
  });
});
