const SPLIT_BY_NEW_LINE = /.*?(?=(?<=("|,.*?))\n(?=("|.*?,))|$)/gs; // Match everything which is preceded by a new line that has text matching before and after
const SPLIT_BY_COMMA = /.*?(?=(?<=\w*?),(?="(.*?)"|(\w+[^"]))|$)/gs; // Match everything which is preceded by comma that has text before and after

const isEscapedByQuote = (cell: string) =>
  !!cell.match(/(?<=^")(.*?)(?="$)/gs)?.length; // Matches everything inside "", taking the earliest and latest "

const hasQuoteOrNewline = (cell: string) => !!cell.match(/("|\n)/gs)?.length;

const hasCommaAtTheEnd = (row: string) => !!row.match(/,$/gs)?.length;

const splitHeader = (data: string[][]) => ({
  header: data.slice(0, 1)[0],
  data: data.slice(1),
});

const validateQuoteEscape = (cell: string): void => {
  if (!isEscapedByQuote(cell) && hasQuoteOrNewline(cell))
    throw new Error("Double quote needs to be enclosed in double quotes");
};

const findMatches = (value: string, regex: RegExp) =>
  (value.match(regex) ?? []).filter(Boolean);

const validateAndReturnCells = (row: string[]): string[] =>
  row.map((cell) => (validateQuoteEscape(cell), cell.replace(/^"|"$/g, "")));

type CsvParserResult =
  | { type: "success"; header?: string[]; data: string[][] }
  | { type: "error"; message: string };

export function csvParser(input: string, useHeader?: boolean): CsvParserResult {
  const rows = findMatches(input.trimEnd(), SPLIT_BY_NEW_LINE);
  let cellCount = -1;
  try {
    const data = rows.map((row, index) => {
      if (hasCommaAtTheEnd(row))
        throw new Error("Comma at the end of the row is not allowed");

      const cells = findMatches(row, SPLIT_BY_COMMA);

      if (index === 0) cellCount = cells.length;

      if (cellCount !== cells.length)
        throw new Error("Rows must have the same number of fields");

      return validateAndReturnCells(cells);
    });

    return { type: "success", ...(useHeader ? splitHeader(data) : { data }) };
  } catch (err: any) {
    return { type: "error", message: err.message };
  }
}
