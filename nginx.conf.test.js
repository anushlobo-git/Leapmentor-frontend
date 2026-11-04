import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const nginxConfig = readFileSync("nginx.conf", "utf8");

describe("frontend nginx asset handling", () => {
  it("does not serve index.html for missing hashed assets", () => {
    expect(nginxConfig).toContain("location /assets/");
    expect(nginxConfig).toContain("try_files $uri =404;");
  });

  it("does not permanently cache the HTML application shell", () => {
    expect(nginxConfig).toContain(
      'add_header Cache-Control "no-cache, no-store, must-revalidate"',
    );
  });
});
