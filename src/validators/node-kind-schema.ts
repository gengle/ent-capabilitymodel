export type FieldType = "string" | "number" | "boolean" | "enum" | "date";

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];   // only for enum
  default?: unknown;
}

export interface NodeKindSchema {
  fields: FieldDefinition[];
}

export interface SchemaValidationError {
  field: string;
  message: string;
}

const VALID_TYPES: FieldType[] = ["string", "number", "boolean", "enum", "date"];

/** Validate the structure of a NodeKind schema definition itself. */
export function validateNodeKindSchema(raw: unknown): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return [{ field: "schema", message: "Schema must be an object" }];
  }

  const schema = raw as Record<string, unknown>;

  if (!Array.isArray(schema.fields)) {
    return [{ field: "schema.fields", message: "Schema must have a 'fields' array" }];
  }

  (schema.fields as unknown[]).forEach((f, i) => {
    const prefix = `fields[${i}]`;
    if (typeof f !== "object" || f === null) {
      errors.push({ field: prefix, message: "Each field must be an object" });
      return;
    }
    const field = f as Record<string, unknown>;

    if (typeof field.name !== "string" || field.name.trim() === "") {
      errors.push({ field: `${prefix}.name`, message: "Field name must be a non-empty string" });
    }
    if (!VALID_TYPES.includes(field.type as FieldType)) {
      errors.push({ field: `${prefix}.type`, message: `Field type must be one of: ${VALID_TYPES.join(", ")}` });
    }
    if (typeof field.required !== "boolean") {
      errors.push({ field: `${prefix}.required`, message: "Field required must be a boolean" });
    }
    if (field.type === "enum") {
      if (!Array.isArray(field.options) || (field.options as unknown[]).length === 0) {
        errors.push({ field: `${prefix}.options`, message: "Enum field must have a non-empty options array" });
      } else if (!(field.options as unknown[]).every((o) => typeof o === "string")) {
        errors.push({ field: `${prefix}.options`, message: "Enum options must all be strings" });
      }
    }
  });

  return errors;
}

/** Validate a properties object against a parsed NodeKind schema. */
export function validateProperties(
  properties: Record<string, unknown>,
  schema: NodeKindSchema
): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];

  for (const field of schema.fields) {
    const value = properties[field.name];

    if (value === undefined || value === null) {
      if (field.required) {
        errors.push({ field: field.name, message: `Required field '${field.name}' is missing` });
      }
      continue;
    }

    switch (field.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push({ field: field.name, message: `Field '${field.name}' must be a string` });
        }
        break;
      case "number":
        if (typeof value !== "number") {
          errors.push({ field: field.name, message: `Field '${field.name}' must be a number` });
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push({ field: field.name, message: `Field '${field.name}' must be a boolean` });
        }
        break;
      case "date":
        if (typeof value !== "string" || isNaN(Date.parse(value as string))) {
          errors.push({ field: field.name, message: `Field '${field.name}' must be a valid date string` });
        }
        break;
      case "enum":
        if (!field.options?.includes(value as string)) {
          errors.push({
            field: field.name,
            message: `Field '${field.name}' must be one of: ${field.options?.join(", ")}`,
          });
        }
        break;
    }
  }

  return errors;
}

export function parseSchema(raw: string): NodeKindSchema {
  return JSON.parse(raw) as NodeKindSchema;
}

export function serializeSchema(schema: NodeKindSchema): string {
  return JSON.stringify(schema);
}
