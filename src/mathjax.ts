import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { MathML } from "mathjax-full/js/input/mathml";
import { SVG } from "mathjax-full/js/output/svg.js";

import { browserAdaptor } from "mathjax-full/js/adaptors/browserAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

type ConvertOptions = {
  display?: boolean;
  em?: number;
  ex?: number;
  containerWidth?: number;
};

const adaptor = browserAdaptor();
RegisterHTMLHandler(adaptor);

const svg = new SVG({ fontCache: "local" });

const defaults: ConvertOptions = {
  display: false,
  em: 16,
  ex: 8,
  containerWidth: 80 * 16,
};

export function tex2svg(
  formula: string,
  options?: ConvertOptions,
): SVGSVGElement {
  const tex = new TeX({ packages: AllPackages });
  const tex_to_svg = mathjax.document("", { InputJax: tex, OutputJax: svg });
  return (tex_to_svg.convert(formula, { ...defaults, ...options }))
    .firstElementChild as SVGSVGElement;
}

export function mathml2svg(formula: string): SVGSVGElement {
  const mathml = new MathML({});
  const mathml_to_svg = mathjax.document("", {
    InputJax: mathml,
    OutputJax: svg,
  });
  return mathml_to_svg.convert(formula, defaults).firstElementChild as SVGSVGElement;;
}
