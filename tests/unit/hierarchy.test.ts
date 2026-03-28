import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing services
vi.mock("../../src/db/client", () => ({
  prisma: {
    node: {
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    nodeKind: {
      findUnique: vi.fn(),
    },
    model: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/db/client";
import { createNode } from "../../src/services/node";

const mockPrisma = prisma as unknown as {
  node: {
    findUnique: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  nodeKind: { findUnique: ReturnType<typeof vi.fn> };
  model: { findUnique: ReturnType<typeof vi.fn> };
};

const BASE_KIND = {
  id: "kind-1",
  name: "BusinessCapability",
  description: null,
  schema: JSON.stringify({ fields: [{ name: "owner_team", type: "string", required: true }] }),
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.node.create.mockResolvedValue({ id: "new-node" });
  mockPrisma.nodeKind.findUnique.mockResolvedValue(BASE_KIND);
});

describe("Hierarchy constraint enforcement", () => {
  it("creates a level 1 node without parent", async () => {
    await expect(
      createNode({ name: "Domain A", level: 1, modelId: "m1" })
    ).resolves.toBeDefined();
  });

  it("rejects a level 1 node with a parent", async () => {
    await expect(
      createNode({ name: "Domain A", level: 1, parentId: "some-id", modelId: "m1" })
    ).rejects.toThrow("Level 1");
  });

  it("rejects a level 2 node without a parent", async () => {
    await expect(
      createNode({ name: "Group A", level: 2, modelId: "m1" })
    ).rejects.toThrow("must have a parent");
  });

  it("rejects a level 3 node whose parent is level 1 (wrong level)", async () => {
    mockPrisma.node.findUnique.mockResolvedValue({ id: "parent", level: 1, modelId: "m1" });
    await expect(
      createNode({ name: "Cap A", level: 3, parentId: "parent", modelId: "m1", kindId: "kind-1" })
    ).rejects.toThrow("expected level 2");
  });

  it("rejects a node whose parent belongs to a different model", async () => {
    mockPrisma.node.findUnique.mockResolvedValue({ id: "parent", level: 2, modelId: "other-model" });
    await expect(
      createNode({ name: "Cap A", level: 3, parentId: "parent", modelId: "m1", kindId: "kind-1" })
    ).rejects.toThrow("same Model");
  });

  it("rejects level > 4", async () => {
    await expect(
      createNode({ name: "X", level: 5 as never, modelId: "m1" })
    ).rejects.toThrow("between 1 and 4");
  });
});

describe("Kind constraint enforcement", () => {
  it("rejects a level 1 node with a kind", async () => {
    await expect(
      createNode({ name: "Domain A", level: 1, modelId: "m1", kindId: "kind-1" })
    ).rejects.toThrow("must not have a kind");
  });

  it("rejects a level 2 node with a kind", async () => {
    mockPrisma.node.findUnique.mockResolvedValue({ id: "parent", level: 1, modelId: "m1" });
    await expect(
      createNode({ name: "Group A", level: 2, parentId: "parent", modelId: "m1", kindId: "kind-1" })
    ).rejects.toThrow("must not have a kind");
  });

  it("rejects a level 3 node without a kind", async () => {
    mockPrisma.node.findUnique.mockResolvedValue({ id: "parent", level: 2, modelId: "m1" });
    await expect(
      createNode({ name: "Cap A", level: 3, parentId: "parent", modelId: "m1" })
    ).rejects.toThrow("must have a kind");
  });

  it("rejects a level 4 node without a kind", async () => {
    mockPrisma.node.findUnique.mockResolvedValue({ id: "parent", level: 3, modelId: "m1" });
    await expect(
      createNode({ name: "SubCap A", level: 4, parentId: "parent", modelId: "m1" })
    ).rejects.toThrow("must have a kind");
  });

  it("accepts a level 3 node with a valid kind and valid properties", async () => {
    mockPrisma.node.findUnique.mockResolvedValue({ id: "parent", level: 2, modelId: "m1" });
    await expect(
      createNode({
        name: "Cap A",
        level: 3,
        parentId: "parent",
        modelId: "m1",
        kindId: "kind-1",
        properties: { owner_team: "Platform" },
      })
    ).resolves.toBeDefined();
  });
});
