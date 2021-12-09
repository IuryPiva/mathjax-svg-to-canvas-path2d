import { serve } from "https://deno.land/std@0.115.1/http/server.ts";
const { compilerOptions } = JSON.parse(
  await Deno.readTextFile("./tsconfig.json"),
);

async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  console.log({ pathname });

  const { files } = await Deno.emit(`./src/app.ts`, {
    bundle: "module",
    check: false,
    compilerOptions,
  });

  const scripts: string[] = [];

  for (const [filename, file] of Object.entries(files)) {
    console.log({filename})
    scripts.push(`
      <script type="module">${file}</script>
    `);
  }

  const html = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script>
      MathJax = {
        svg: { fontCache: 'local' },
        loader: { load: ['[tex]/color'] },
        tex: { packages: { '[+]': ['color'] } },
        startup: {
          ready: function () {
            MathJax.startup.defaultReady();
            window.run()
          }
        }
      }
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-svg.js"></script>
    ${scripts.join("\n")}
    <style>
      div {
        border: 2px solid black;
      }

      div>* {
        border: 1px solid black;
        margin: 8px;
      }
    </style>
  </head>

  <body>
  </body>

  </html>
  `;

  return new Response(
    html,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

console.log("Listening on http://localhost:8000");
serve(handleRequest);
