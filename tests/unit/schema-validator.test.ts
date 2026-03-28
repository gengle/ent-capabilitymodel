import { describe, it, expect } from "vitest";
import {
  validateNodeKindSchema,
  validateProperties,
  type NodeKindSchema,
} from "../../src/validators/node-kind-schema";

describe("validateNodeKindSchema", () => {
  it("accepts a valid schema", () => {
    const schema: NodeKindSchema = {
      fields: [
        { name: "maturity", type: "enum", required: true, options: ["Initial", "Defined"] },
        { name: "owner_team", type: "string", required: true },
        { name: "cost", type: "number", required: false },
        { name: "active", type: "boolean", required: false },
        { name: "review_date", type: "date", required: false },
      ],
    };
    expect(validateNodeKindSchema(schema)).toHaveLength(0);
  });

  it("rejects a non-object schema", () => {
    expect(validateNodeKindSchema("oops")).not.toHaveLength(0);
    expect(validateNodeKindSchema(null)).not.toHaveLength(0);
  });

  it("rejects schema without fields array", () => {
    expect(validateNodeKindSchema({})).not.toHaveLength(0);
    expect(validateNodeKindSchema({ fields: "nope" })).not.toHaveLength(0);
  });

  it("rejects field with invalid type", () => {
    const errors = validateNodeKindSchema({
      fields: [{ name: "x", type: "uuid", required: false }],
    });
    expect(errors.some((e) => e.message.includes("type"))).toBe(true);
  });

  it("rejects enum field without options", () => {
    const errors = validateNodeKindSchema({
      fields: [{ name: "status", type: "enum", required: true }],
    });
    expect(errors.some((e) => e.message.includes("options"))).toBe(true);
  });

  it("rejects enum field with empty options", () => {
    const errors = validateNodeKindSchema({
      fields: [{ name: "status", type: "enum", required: true, options: [] }],
    });
    expect(errors.some((e) => e.message.includes("options"))).toBe(true);
  });
});

describe("validateProperties", () => {
  const schema: NodeKindSchema = {
    fields: [
      { name: "maturity", type: "enum", required: true, options: ["Initial", "Defined", "Optimizing"] },
      { name: "owner_team", type: "string", required: true },
      { name: "cost", type: "number", required: false },
      { name: "active", type: "boolean", required: false },
      { name: "review_date", type: "date", required: false },
    ],
  };

  it("accepts valid properties", () => {
    const errors = validateProperties(
      { maturity: "Initial", owner_team: "Platform" },
      schema
    );
    expect(errors).toHaveLength(0);
  });

  it("rejects missing required field", () => {
    const errors = validateProperties({ owner_team: "Platform" }, schema);
    expect(errors.some((e) => e.field === "maturity" && e.message.includes("missing"))).toBe(true);
  });

  it("rejects wrong type — number field given string", () => {
    const errors = validateProperties(
      { maturity: "Initial", owner_team: "Platform", cost: "free" },
      schema
    );
    expect(errors.some((e) => e.field === "cost")).toBe(true);
  });

  it("rejects wrong type — boolean field given string", () => {
    const errors = validateProperties(
      { maturity: "Initial", owner_team: "Platform", active: "yes" },
      schema
    );
    expect(errors.some((e) => e.field === "active")).toBe(true);
  });

  it("rejects invalid enum value", () => {
    const errors = validateProperties(
      { maturity: "Unknown", owner_team: "Platform" },
      schema
    );
    expect(errors.some((e) => e.field === "maturity")).toBe(true);
  });

  it("rejects invalid date string", () => {
    const errors = validateProperties(
      { maturity: "Initial", owner_team: "Platform", review_date: "not-a-date" },
      schema
    );
    expect(errors.some((e) => e.field === "review_date")).toBe(true);
  });

  it("accepts optional fields when omitted", () => {
    const errors = validateProperties(
      { maturity: "Defined", owner_team: "Platform" },
      schema
    );
    expect(errors).toHaveLength(0);
  });

  it("accepts valid date string", () => {
    const errors = validateProperties(
      { maturity: "Defined", owner_team: "Platform", review_date: "2026-06-01" },
      schema
    );
    expect(errors).toHaveLength(0);
  });
});
