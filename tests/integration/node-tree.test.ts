import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../src/db/client";
import { createModelType, deleteModelType } from "../../src/services/model-type";
import { createNodeKind } from "../../src/services/node-kind";
import { createModel, deleteModel } from "../../src/services/model";
import { createNode, getSubtree, getAncestors, deleteNode } from "../../src/services/node";

/**
 * Integration test: builds a full 4-level node tree and verifies
 * traversal, constraints, and cascade behaviour.
 *
 * Requires a real SQLite database (prisma/dev.db).
 */
describe("Full 4-level node tree", () => {
  let modelTypeId: string;
  let kindId: string;
  let modelId: string;

  let domainId: string;
  let groupId: string;
  let capabilityId: string;
  let subCapabilityId: string;

  beforeAll(async () => {
    // Seed shared taxonomy and model
    const mt = await createModelType({ name: `IntegTest-MT-${Date.now()}`, description: "test" });
    modelTypeId = mt.id;

    const kind = await createNodeKind({
      name: `IntegTest-Kind-${Date.now()}`,
      schema: {
        fields: [
          { name: "maturity", type: "enum", required: true, options: ["Initial", "Defined"] },
          { name: "owner_team", type: "string", required: false },
        ],
      },
    });
    kindId = kind.id;

    const model = await createModel({ name: "Integration Test Model", modelTypeId });
    modelId = model.id;
  });

  afterAll(async () => {
    await deleteModel(modelId);
    await deleteModelType(modelTypeId);
    await prisma.nodeKind.delete({ where: { id: kindId } });
    await prisma.$disconnect();
  });

  it("creates level 1 (Domain) node", async () => {
    const node = await createNode({ name: "Customer", level: 1, modelId });
    domainId = node.id;
    expect(node.level).toBe(1);
    expect(node.parentId).toBeNull();
    expect(node.kindId).toBeNull();
  });

  it("creates level 2 (Group) node under Domain", async () => {
    const node = await createNode({ name: "Acquisition", level: 2, parentId: domainId, modelId });
    groupId = node.id;
    expect(node.level).toBe(2);
    expect(node.parentId).toBe(domainId);
  });

  it("creates level 3 (Capability) node with kind under Group", async () => {
    const node = await createNode({
      name: "Lead Management",
      level: 3,
      parentId: groupId,
      modelId,
      kindId,
      properties: { maturity: "Initial", owner_team: "Sales" },
    });
    capabilityId = node.id;
    expect(node.level).toBe(3);
    expect(node.kindId).toBe(kindId);
  });

  it("creates level 4 (Sub-capability) node under Capability", async () => {
    const node = await createNode({
      name: "Lead Scoring",
      level: 4,
      parentId: capabilityId,
      modelId,
      kindId,
      properties: { maturity: "Defined" },
    });
    subCapabilityId = node.id;
    expect(node.level).toBe(4);
  });

  it("getSubtree returns domain and all descendants in order", async () => {
    const tree = await getSubtree(domainId);
    const ids = tree.map((n) => n.id);
    expect(ids).toContain(domainId);
    expect(ids).toContain(groupId);
    expect(ids).toContain(capabilityId);
    expect(ids).toContain(subCapabilityId);
    // Root must be first
    expect(ids[0]).toBe(domainId);
  });

  it("getAncestors returns path from root to parent", async () => {
    const ancestors = await getAncestors(subCapabilityId);
    const ids = ancestors.map((n) => n.id);
    expect(ids).toContain(domainId);
    expect(ids).toContain(groupId);
    expect(ids).toContain(capabilityId);
    // Domain (L1) should be first
    expect(ids[0]).toBe(domainId);
  });

  it("getAncestors returns empty array for root node", async () => {
    const ancestors = await getAncestors(domainId);
    expect(ancestors).toHaveLength(0);
  });

  it("rejects deleting a node that has children", async () => {
    await expect(deleteNode(domainId)).rejects.toThrow("child node");
  });

  it("rejects creating a level 3 node without a kind", async () => {
    await expect(
      createNode({ name: "No Kind", level: 3, parentId: groupId, modelId })
    ).rejects.toThrow("must have a kind");
  });

  it("rejects creating a node with invalid properties", async () => {
    await expect(
      createNode({
        name: "Bad Props",
        level: 3,
        parentId: groupId,
        modelId,
        kindId,
        properties: { maturity: "INVALID_OPTION" },
      })
    ).rejects.toThrow("validation failed");
  });
});
