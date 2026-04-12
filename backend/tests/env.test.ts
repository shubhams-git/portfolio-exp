import { describe, expect, it } from "vitest";

import { loadEnv } from "../src/config/env.js";

describe("loadEnv", () => {
  it("normalizes configured allowed origins", () => {
    const parsedEnv = loadEnv({
      ALLOWED_ORIGINS:
        " https://portfolio-exp.vercel.app/ , http://127.0.0.1:5173/contact-form ",
    });

    expect(parsedEnv.ALLOWED_ORIGINS).toEqual([
      "https://portfolio-exp.vercel.app",
      "http://127.0.0.1:5173",
    ]);
  });
});
