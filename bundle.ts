
console.log(Deno.readTextFileSync("./tsconfig.json"))
const {compilerOptions} = JSON.parse(Deno.readTextFileSync("./tsconfig.json"))

const { files, diagnostics } = await Deno.emit("./src/app.ts", {
  bundle: "module",
  check: false,
  compilerOptions
});

for (const fileName in files) {
  const {pathname} = new URL(fileName);
  await Deno.writeTextFile("."+pathname, files[fileName])
}