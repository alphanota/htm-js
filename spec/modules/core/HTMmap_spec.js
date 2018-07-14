import HTMmap from "../../../modules/core/HTMmap";

const map = new HTMmap();

describe("HTMmap", () => {
  describe("nameToId", () => {
    it("should work", () => {
      expect(map.nameToId("N0110303313303212")).toBe(13234044134);
    });
  });

  describe("when converting coordinates", () => {
    it("should return an id from a lon,lat pair", () => {
      expect(map.lookupIdLonLat(-73.52, 43.7, 26)).toBe(57473906852051176);
    });
  });
});
