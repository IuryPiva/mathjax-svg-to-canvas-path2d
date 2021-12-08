import { mathml2svg, tex2svg } from "./mathjax";
import { create_canvas_from_svg } from "./svg_to_canvas";

document.body.replaceChildren("");

const formulas = [
  `\\begin{align}
  \\dot{x} & = \\sigma(y-x) \\\\
\\dot{y} & = \\rho x - y - xz \\\\
\\dot{z} & = -\\beta z + xy
\\end{align}`,
  "x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.",
  `\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq
  \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)`,
  `\\mathbf{V}_1 \\times \\mathbf{V}_2 =
  \\begin{vmatrix}
   \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\
   \\frac{\\partial X}{\\partial u} & \\frac{\\partial Y}{\\partial u} & 0 \\\\
   \\frac{\\partial X}{\\partial v} & \\frac{\\partial Y}{\\partial v} & 0 \\\\
  \\end{vmatrix}`,
  `P(E) = {n \\choose k} p^k (1-p)^{ n-k} `,
  `\\frac{1}{(\\sqrt{\\phi \\sqrt{5}}-\\phi) e^{\\frac25 \\pi}} =
  1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}}
   {1+\\frac{e^{-8\\pi}} {1+\\ldots} } } }`,
  `1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots =
   \\prod_{j=0}^{\\infty}\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})},
    \\quad\\quad \\text{for $|q| < 1$}.`,
  `\\begin{align}
  \\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
  \\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\\\
  \\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\\\
  \\nabla \\cdot \\vec{\\mathbf{B}} & = 0
\\end{align}`,
];
console.log("formulas", formulas.length);

const style_tex = (text) => `\\color[RGB]{0,0,255} \\bf{${text}}`;
for (const formula of formulas) {
  create_canvas_from_svg(tex2svg(formula));
}
create_canvas_from_svg(tex2svg(style_tex(formulas[0])));

const mathml_formulas = [`<math>
<mrow>
  <mi>x</mi>
  <mo>=</mo>
  <mfrac>
    <mrow>
    <mrow>
      <mo>-</mo>
      <mi>b</mi>
    </mrow>
    <mo>&#xB1;</mo>
    <msqrt>
      <mrow>
      <msup>
        <mi>b</mi>
        <mn>2</mn>
      </msup>
      <mo>-</mo>
      <mrow>
        <mn>4</mn>
        <mo>&#x2062;</mo>
        <mi>a</mi>
        <mo>&#x2062;</mo>
        <mi>c</mi>
      </mrow>
      </mrow>
    </msqrt>
    </mrow>
    <mrow>
    <mn>2</mn>
    <mo>&#x2062;</mo>
    <mi>a</mi>
    </mrow>
  </mfrac>
</mrow>
</math>`];

export function insert_text_on_position(
  destination: string,
  position: number,
  text_to_be_inserted: string,
) {
  const result_text = [];
  result_text.push(destination.slice(0, position));
  result_text.push(text_to_be_inserted);
  result_text.push(destination.slice(position));
  return result_text.join("");
}

function styled_formula(text): string {
  let styled = text.trim();
  let matchs = styled.match(/<math(.*?[^?])?>/s);
  if (!matchs) {
    return text.trim();
  }

  styled = insert_text_on_position(
    styled,
    styled.indexOf(matchs[0]) + matchs[0].length,
    `<mstyle mathcolor="#0000ff" mathvariant="bold">`,
  );

  matchs = styled.match(/<\/[^>]*?math.*?>/s);
  if (!matchs) {
    return text.trim();
  }

  return insert_text_on_position(
    styled,
    styled.indexOf(matchs[0]),
    "</mstyle>",
  );
}

for (const formula of mathml_formulas) {
  create_canvas_from_svg(mathml2svg(formula));
  create_canvas_from_svg(mathml2svg(styled_formula(formula)));
}
