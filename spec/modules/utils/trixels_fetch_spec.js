import HTMmap from "../../../modules/core/HTMmap";
import TrixelUtils from "../../../modules/utils/trixels_fetch";

const map = new HTMmap();
const trixelUtils = new TrixelUtils(map);
describe("TrixelUtils", () => {
  describe("when getting trixels covering a bound", () => {
    it("should work", () => {
      const nw = { lon: -73, lat: 52 };
      const sw = { lon: -73, lat: 51 };
      const se = { lon: -72, lat: 51 };
      const ne = { lon: -72, lat: 52 };

      const expectedValue = {
        startTrixId: 12884901888,
        endTrixId: 13958643711
      };
      expect(trixelUtils.fetchTrixelsFromView(nw, sw, se, ne)).toEqual(
        expectedValue
      );
    });
  });
});
