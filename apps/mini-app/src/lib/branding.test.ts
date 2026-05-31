import { afterEach, describe, expect, it, vi } from "vitest";
import { getPromptAnatomyShareLine, PROMPT_ANATOMY_URL } from "./branding";

describe("branding", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults PROMPT_ANATOMY_URL to promptanatomy.app", () => {
    expect(PROMPT_ANATOMY_URL).toBe("https://www.promptanatomy.app");
  });

  it("getPromptAnatomyShareLine includes brand name and URL", () => {
    const line = getPromptAnatomyShareLine();
    expect(line).toContain("Prompt Anatomy");
    expect(line).toContain("https://www.promptanatomy.app");
  });

  it("getPromptAnatomyShareLine respects VITE_PROMPT_ANATOMY_URL override", () => {
    vi.stubEnv("VITE_PROMPT_ANATOMY_URL", "https://example.test/pa");
    vi.resetModules();
    return import("./branding").then(({ getPromptAnatomyShareLine: shareLine }) => {
      expect(shareLine()).toBe("Built with Prompt Anatomy — https://example.test/pa");
    });
  });
});
