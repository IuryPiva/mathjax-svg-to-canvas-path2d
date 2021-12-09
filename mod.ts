import { serve } from "https://deno.land/std@0.115.1/http/server.ts";
const { compilerOptions } = JSON.parse(
  Deno.readTextFileSync("./tsconfig.json"),
);

async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  console.log({ pathname });

  if (pathname != "/") {
    if (pathname.endsWith(".ts")) {
      const { files } = await Deno.emit(`.${pathname}`, {
        bundle: "module",
        check: false,
        compilerOptions,
      });

      for (const [fileName, file] of Object.entries(files)) {
        if (!fileName.endsWith(".map")) {
          return new Response(file, {
            headers: {
              "content-type": "application/javascript",
            },
          });
        }
      }
    }

    const file = await Deno.readFile(
      `.${pathname}`,
    );
    return new Response(file, {
      headers: {
        "content-type": "application/javascript",
      },
    });
  }

  return new Response(
    await Deno.readFile("./index.html"),
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

console.log("Listening on http://localhost:8000");
serve(handleRequest);
