import { describe, expect, it } from "vitest";
import { assembleSkillContext, type SkillOverrideOptions } from "../services/heartbeat.js";
import fs from "node:fs/promises";
import path from "node:path";

describe("assembleSkillContext", () => {
  const dummySkills = [
    { key: "skill1", source: "/original/skill1" },
    { key: "skill2", source: "/original/skill2" }
  ];

  it("should return original skills if no override is provided", async () => {
    const result = await assembleSkillContext(dummySkills, undefined);
    expect(result).toEqual(dummySkills);
  });

  it("should exclude a skill when mode is exclude", async () => {
    const override: SkillOverrideOptions = {
      mode: "exclude",
      skillId: "skill1"
    };
    const result = await assembleSkillContext(dummySkills, override);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("skill2");
  });

  it("should replace a skill with a temp directory when mode is replace", async () => {
    const override: SkillOverrideOptions = {
      mode: "replace",
      skillId: "skill2",
      snapshot: {
        name: "Skill 2 Draft",
        description: "Draft desc",
        skillMd: "# Draft MD",
        scripts: [],
        references: [],
        assets: []
      }
    };
    
    const result = await assembleSkillContext(dummySkills, override);
    expect(result).toHaveLength(2);
    
    const skill1 = result.find(s => s.key === "skill1");
    expect(skill1?.source).toBe("/original/skill1");

    const skill2 = result.find(s => s.key === "skill2");
    expect(skill2?.source).not.toBe("/original/skill2");
    expect(skill2?.source).toContain("paperclip-skill-eval-");

    // Verify temp dir contents
    if (skill2?.source) {
      const content = await fs.readFile(path.join(skill2.source, "SKILL.md"), "utf8");
      expect(content).toBe("# Draft MD");
    }
  });

  it("should write scripts and references to the temp directory", async () => {
    const override: SkillOverrideOptions = {
      mode: "replace",
      skillId: "skill1",
      snapshot: {
        name: "Skill 1 Draft",
        description: "Draft desc",
        skillMd: "# Draft MD",
        scripts: [{ path: "bin/run.sh", content: "echo hello" }],
        references: [{ path: "docs/ref.md", content: "reference" }],
        assets: []
      }
    };

    const result = await assembleSkillContext(dummySkills, override);
    const skill1 = result.find(s => s.key === "skill1");
    expect(skill1?.source).toBeDefined();

    if (skill1?.source) {
      const scriptContent = await fs.readFile(path.join(skill1.source, "bin/run.sh"), "utf8");
      expect(scriptContent).toBe("echo hello");

      const refContent = await fs.readFile(path.join(skill1.source, "docs/ref.md"), "utf8");
      expect(refContent).toBe("reference");
    }
  });

  it("concurrent invocations don't leak", async () => {
    const overrides: SkillOverrideOptions[] = [
      {
        mode: "replace",
        skillId: "skill1",
        snapshot: {
          name: "A",
          description: "A",
          skillMd: "# A",
          scripts: [{ path: "scripts/a.js", content: "A" }],
          references: [],
          assets: [],
        },
      },
      {
        mode: "replace",
        skillId: "skill1",
        snapshot: {
          name: "B",
          description: "B",
          skillMd: "# B",
          scripts: [{ path: "scripts/b.js", content: "B" }],
          references: [],
          assets: [],
        },
      },
      {
        mode: "exclude",
        skillId: "skill1",
      },
    ];

    const results = await Promise.all(overrides.map((override) => assembleSkillContext(dummySkills, override)));

    const replacedA = results[0].find((s) => s.key === "skill1");
    const replacedB = results[1].find((s) => s.key === "skill1");
    const excluded = results[2];

    expect(replacedA?.source).toBeDefined();
    expect(replacedB?.source).toBeDefined();
    expect(replacedA?.source).not.toEqual(replacedB?.source);
    expect(excluded.find((s) => s.key === "skill1")).toBeUndefined();

    if (replacedA?.source) {
      const mdA = await fs.readFile(path.join(replacedA.source, "SKILL.md"), "utf8");
      expect(mdA).toBe("# A");
    }
    if (replacedB?.source) {
      const mdB = await fs.readFile(path.join(replacedB.source, "SKILL.md"), "utf8");
      expect(mdB).toBe("# B");
    }
  });
});
