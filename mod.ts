import { serve } from "https://deno.land/std@0.115.1/http/server.ts";

async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith(".ts")) {
    const file = await Deno.readFile(`./dist${pathname}.js`);
    return new Response(file, {
      headers: {
        "content-type": "application/javascript",
      },
    });
  }

  if (pathname.includes("node_modules")) {
    const file = await Deno.readFile(`.${pathname}`);
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