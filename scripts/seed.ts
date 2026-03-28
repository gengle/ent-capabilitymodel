/**
 * Seed script — creates a sample Enterprise Capability Model for development/testing.
 * Run with: npx ts-node scripts/seed.ts
 */
import { createModelType } from "../src/services/model-type";
import { createNodeKind } from "../src/services/node-kind";
import { createModel } from "../src/services/model";
import { createNode } from "../src/services/node";
import { prisma } from "../src/db/client";

async function seed() {
  console.log("Seeding...");

  const modelType = await createModelType({
    name: "BusinessCapabilityModel",
    description: "Business capability model type",
  });

  const kind = await createNodeKind({
    name: "BusinessCapability",
    description: "A business capability with maturity and ownership",
    schema: {
      fields: [
        {
          name: "maturity",
          type: "enum",
          required: true,
          options: ["Initial", "Developing", "Defined", "Managed", "Optimizing"],
        },
        { name: "owner_team", type: "string", required: false },
        { name: "criticality", type: "enum", required: false, options: ["Low", "Medium", "High"] },
      ],
    },
  });

  const model = await createModel({
    name: "Enterprise Capability Map 2026",
    description: "Top-level business capability model",
    modelTypeId: modelType.id,
  });

  const domains = [
    { name: "Customer", groups: ["Acquisition", "Retention", "Service"] },
    { name: "Finance", groups: ["Billing", "Reporting"] },
    { name: "Operations", groups: ["Supply Chain", "Fulfillment"] },
  ];

  const capabilities: Record<string, string[]> = {
    Acquisition: ["Lead Management", "Campaign Execution", "Partner Management"],
    Retention: ["Churn Prediction", "Loyalty Programs"],
    Service: ["Case Management", "Self-Service Portal", "Knowledge Base"],
    Billing: ["Invoice Generation", "Payment Processing", "Credit Management"],
    Reporting: ["Financial Reporting", "Management Dashboards"],
    "Supply Chain": ["Inventory Management", "Supplier Relations", "Demand Planning"],
    Fulfillment: ["Order Processing", "Logistics Coordination", "Returns Management"],
  };

  const maturityOptions = ["Initial", "Developing", "Defined", "Managed", "Optimizing"];

  for (const domain of domains) {
    const domainNode = await createNode({ name: domain.name, level: 1, modelId: model.id });

    for (const groupName of domain.groups) {
      const groupNode = await createNode({
        name: groupName,
        level: 2,
        parentId: domainNode.id,
        modelId: model.id,
      });

      const caps = capabilities[groupName] ?? [];
      for (const capName of caps) {
        const cap = await createNode({
          name: capName,
          level: 3,
          parentId: groupNode.id,
          modelId: model.id,
          kindId: kind.id,
          properties: {
            maturity: maturityOptions[Math.floor(Math.random() * maturityOptions.length)],
            owner_team: `${groupName} Team`,
          },
        });

        // Add one sub-capability to the first capability in each group
        if (capName === caps[0]) {
          await createNode({
            name: `${capName} — Core`,
            level: 4,
            parentId: cap.id,
            modelId: model.id,
            kindId: kind.id,
            properties: { maturity: "Initial" },
          });
        }
      }
    }
  }

  console.log(`✓ Seeded model: "${model.name}" (id: ${model.id})`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
