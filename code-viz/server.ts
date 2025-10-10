import { serve } from "bun";
import { spawn } from "bun";

// Compile TypeScript en continu
spawn({
  cmd: ["bun", "x", "tsc", "--watch"],
  stdout: "inherit",
  stderr: "inherit"
});

// Serveur Bun
serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;

    // Ignore favicon
    if (path === "/favicon.ico") {
      return new Response("", { status: 204 });
    }

    // Sert les modules depuis node_modules
    if (path.startsWith("/node_modules/")) {
      return new Response(Bun.file(`.${path}`));
    }

    // Sert les fichiers publics
    return new Response(Bun.file(`public${path}`));
  },
});
