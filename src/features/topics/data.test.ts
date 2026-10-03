import { describe, expect, it } from "vitest";
import { mapTopicResults } from "./data";

describe("mapTopicResults", () => {
  it("maps the database RPC column names to the topic result model", () => {
    expect(mapTopicResults([{
      option_id: "option-1",
      option_key: "positive",
      option_label: "Gute Idee",
      position: 0,
      selection_count: 3,
      participant_count: 4,
      percentage: "75.0",
    }])).toEqual([{
      id: "option-1",
      key: "positive",
      label: "Gute Idee",
      position: 0,
      selection_count: 3,
      participant_count: 4,
      percentage: 75,
    }]);
  });
});
