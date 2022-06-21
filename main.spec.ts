import { csvParser } from "./main";

describe("CSV Parser", () => {
  describe("Rule 1", () => {
    it("should separate rows by newline", () => {
      const input = "aaa,bbb,ccc\nzzz,yyy,xxx";
      expect(csvParser(input)).toEqual({
        type: "success",
        data: [
          ["aaa", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
      });
    });
  });

  describe("Rule 2", () => {
    it("should separate rows by newline if there is newline at the end", () => {
      const input = "aaa,bbb,ccc\nzzz,yyy,xxx\n";
      expect(csvParser(input)).toEqual({
        type: "success",
        data: [
          ["aaa", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
      });
    });
  });

  describe("Rule 3", () => {
    it("should separate a header", () => {
      const input = "aaa,bbb,ccc\nzzz,yyy,xxx\n";
      expect(csvParser(input, true)).toEqual({
        type: "success",
        header: ["aaa", "bbb", "ccc"],
        data: [["zzz", "yyy", "xxx"]],
      });
    });
  });

  describe("Rule 4", () => {
    it("should return error if there is comma at the end of the row", () => {
      const input = "aaa,bbb,ccc,\nzzz,yyy,xxx\n";
      expect(csvParser(input)).toEqual({
        type: "error",
        message: "Comma at the end of the row is not allowed",
      });
    });

    it("should return error if lines dont contain the same number of fields", () => {
      const input = "aaa,bbb,ccc\nzzz,yyy,xxx,777\n";
      expect(csvParser(input)).toEqual({
        type: "error",
        message: "Rows must have the same number of fields",
      });
    });
  });

  describe("Rule 5", () => {
    it("should parse when one field is enclosed in double quotes", () => {
      const input = '"aaa",bbb,ccc\nzzz,yyy,xxx';
      expect(csvParser(input)).toEqual({
        data: [
          ["aaa", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });

    it("should parse when all fields are enclosed in double quotes", () => {
      const input = '"aaa","bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        data: [
          ["aaa", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });

    it("should return error if field is not enclosed in double quotes, and double quote appears inside", () => {
      const input = 'aa"a,"bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        message: "Double quote needs to be enclosed in double quotes",
        type: "error",
      });
    });

    it("should not return error if field is enclosed in double quotes and double quote appears inside", () => {
      const input = '"aa"a","bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        data: [
          ['aa"a', "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });
  });

  describe("Rule 6", () => {
    it("should parse if newline is in the field that is enclosed in double quotes", () => {
      const input = '"aa\na","bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        data: [
          ["aa\na", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });

    it("should parse if comma is in the field that is enclosed in double quotes", () => {
      const input = '"aa,a","bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        data: [
          ["aa,a", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });

    it("should parse if 2 subsequent newlines are in the field that are enclosed in double quotes", () => {
      const input = '"aa\n\na","bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        data: [
          ["aa\n\na", "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });

    it("should return error if newline is in the field but not enclosed in double quotes", () => {
      const input = 'aa\na,"bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        message: "Double quote needs to be enclosed in double quotes",
        type: "error",
      });
    });
  });

  describe("Rule 7", () => {
    it("should not error if field is enclosed in double quotes and double quote appears inside", () => {
      const input = '"aa""a","bbb","ccc"\n"zzz","yyy","xxx"';
      expect(csvParser(input)).toEqual({
        data: [
          ['aa""a', "bbb", "ccc"],
          ["zzz", "yyy", "xxx"],
        ],
        type: "success",
      });
    });
  });
});
