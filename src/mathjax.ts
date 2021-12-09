type ConvertOptions = {
  display?: boolean;
  em?: number;
  ex?: number;
  containerWidth?: number;
};

const defaults: ConvertOptions = {
  display: false,
  em: 16,
  ex: 8,
  containerWidth: 80 * 16,
};

export function tex2svg(
  formula: string,
): SVGSVGElement {
  return MathJax.tex2svg(formula, defaults).firstElementChild as SVGSVGElement;
}

export function mathml2svg(formula: string): SVGSVGElement {
  return MathJax.mathml2svg(formula, defaults).firstElementChild as SVGSVGElement;;
}
