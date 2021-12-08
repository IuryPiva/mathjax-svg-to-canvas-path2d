const { compilerOptions } = JSON.parse(
  Deno.readTextFileSync("./tsconfig.json"),
);

const { files } = await Deno.emit("./src/app.ts", {
  bundle: "module",
  compilerOptions,
});

const { pathname } = new URL(import.meta.url.split("/").slice(0, -1).join("/"));

try {
  Deno.mkdirSync("./dist");
} catch (error) {
  Deno.removeSync("./dist", { recursive: true });
  Deno.mkdirSync("./dist");
}

for (const [fileName, text] of Object.entries(files)) {
  const url = new URL(fileName);
  const fileDestination = `./dist${url.pathname.replace(pathname, "")}`;
  console.log(fileDestination.split("/").slice(0, -1).join("/"));
  console.log(fileDestination);

  await Deno.mkdirSync(fileDestination.split("/").slice(0, -1).join("/"), {
    recursive: true,
  });
  await Deno.writeTextFile(fileDestination, text);
}
