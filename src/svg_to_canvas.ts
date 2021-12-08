export class MathjaxSVGToCanvas {
  paths: Record<string, string> = {};
  svg: SVGSVGElement;
  ctx: CanvasRenderingContext2D;

  draw(ctx: CanvasRenderingContext2D, svg: SVGSVGElement) {
    this.svg = svg;
    const defs = svg.querySelector("defs");

    for (const kid of defs.children) {
      const data_c = kid.getAttribute("id").split("-").pop();
      this.paths[data_c] = kid.getAttribute("d");
    }

    this.ctx = ctx;
    ctx.save();

    const [initial_x, initial_y, view_width, view_height] = this.svg
      .getAttribute("viewBox").split(
        " ",
      );

    const { ctx_width, ctx_height } = get_ctx_viewbox(svg);
    ctx.scale(
      ctx_width / parseFloat(view_width),
      ctx_height / parseFloat(view_height),
    );

    const init_g = this.svg.querySelector("g");
    this.transform(init_g.getAttribute("transform"));
    ctx.translate(parseFloat(initial_x), parseFloat(initial_y));
    this.walk(init_g.firstElementChild);
    ctx.restore();
  }

  walk(el: Element) {
    this.ctx.save();

    switch (el.tagName) {
      case "rect":
        this.draw_rect(el as SVGRectElement);
        break;

      case "text":
        this.draw_text(el as SVGTextElement);
        break;

      case "line":
        this.draw_line(el as SVGLineElement);
        break;

      case "ellipse":
        this.draw_ellipse(el as SVGEllipseElement);
        break;

      case "g":
        this.parse_container(el as SVGGElement);
        break;

      case "use":
        this.use(el as SVGUseElement);
        break;

      case "title":
        console.error(el.textContent);
        break;

      case "svg":
        this.sub_svg(el as SVGSVGElement);
        break;

      default:
        console.error(`element ${el.tagName} not supported`);
        break;
    }

    for (const kid of el.children) {
      this.walk(kid);
    }

    this.ctx.restore();
  }

  parse_svg_transform_params(val: string): [number, number] {
    const comma = val.trim().split(`,`);
    const space = val.trim().split(` `);

    if (comma.length == 2) return [parseFloat(comma[0]), parseFloat(comma[1])];
    if (space.length == 2) return [parseFloat(space[0]), parseFloat(space[1])];

    if (comma.length == 1 && space.length == 1) {
      return [parseFloat(space[0]), parseFloat(space[0])];
    }
  }

  transform(
    transform_attr: string,
  ) {
    const regex_translate = /translate\((.*?)\)/;
    const regex_scale = /scale\((.*?)\)/;
    const regex_matrix = /matrix\((.*?)\)/;

    const translate_match = regex_translate.exec(transform_attr);
    if (translate_match && translate_match[1]) {
      this.ctx.translate(
        ...this.parse_svg_transform_params(translate_match[1]),
      );
    }

    const scale_match = regex_scale.exec(transform_attr);
    if (scale_match && scale_match[1]) {
      this.ctx.scale(...this.parse_svg_transform_params(scale_match[1]));
    }

    const matrix_match = regex_matrix.exec(transform_attr);
    if (matrix_match && matrix_match[1]) {
      const matrix = matrix_match[1].split(" ").map((val) => parseFloat(val));
      this.ctx.setTransform(
        matrix[0],
        matrix[1],
        matrix[2],
        matrix[3],
        matrix[4],
        matrix[5],
      );
    }
  }

  draw_rect(rect: SVGRectElement) {
    const x = parseFloat(rect.getAttribute("x"));
    const y = parseFloat(rect.getAttribute("y"));
    const width = parseFloat(rect.getAttribute("width"));
    const height = parseFloat(rect.getAttribute("height"));
    const stroke_thickness = parseFloat(rect.getAttribute("stroke-thickness"));
    const stroke_dasharray = rect.getAttribute("stroke-dasharray");

    if (stroke_thickness || stroke_dasharray) {
      this.ctx.save();

      if (stroke_thickness) {
        this.ctx.lineWidth = stroke_thickness;
      }

      if (stroke_dasharray) {
        this.ctx.setLineDash(
          stroke_dasharray.split(" ").map((val) => parseFloat(val)),
        );
      }

      this.ctx.strokeRect(x, y, width, height);
      this.ctx.restore();
    } else {
      this.ctx.fillRect(x, y, width, height);
    }
  }

  draw_line(line: SVGLineElement) {
    const x1 = parseFloat(line.getAttribute("x1"));
    const y1 = parseFloat(line.getAttribute("y1"));
    const x2 = parseFloat(line.getAttribute("x2"));
    const y2 = parseFloat(line.getAttribute("y2"));
    const stroke_thickness = parseFloat(line.getAttribute("stroke-thickness"));
    const stroke_dasharray = line.getAttribute("stroke-dasharray");

    this.ctx.save();
    this.ctx.beginPath();

    if (stroke_thickness) {
      this.ctx.lineWidth = stroke_thickness;
    }

    if (stroke_dasharray) {
      this.ctx.setLineDash(
        stroke_dasharray.split(" ").map((val) => parseFloat(val)),
      );
    }

    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  draw_text(text: SVGTextElement) {
    this.ctx.save();
    this.transform(text.getAttribute("transform"));
    const font_size = text.getAttribute("font-size");
    this.ctx.fillText(text.textContent, 0, 0);
    this.ctx.restore();
  }

  draw_ellipse(
    ellipse: SVGEllipseElement,
  ) {
    const rx = parseFloat(ellipse.getAttribute("rx"));
    const ry = parseFloat(ellipse.getAttribute("ry"));
    const cx = parseFloat(ellipse.getAttribute("cx"));
    const cy = parseFloat(ellipse.getAttribute("cy"));

    const fill = ellipse.getAttribute("fill");
    const stroke_width = parseFloat(ellipse.getAttribute("stroke-width"));

    this.ctx.save();
    this.ctx.fillStyle = fill;
    this.ctx.lineWidth = stroke_width;

    this.ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.restore();
  }

  parse_container(g: SVGGElement) {
    const fill = g.getAttribute("fill");
    if (fill) {
      this.ctx.fillStyle = fill;
    }

    const stroke = g.getAttribute("stroke");
    if (stroke) {
      this.ctx.strokeStyle = stroke;
    }

    const transform_attr = g.getAttribute("transform");
    if (transform_attr) {
      this.transform(transform_attr);
    }
  }

  use(el: SVGUseElement) {
    const transform_attr = el.getAttribute("transform");
    if (transform_attr) {
      this.transform(transform_attr);
    }

    const data_c = el.getAttribute("data-c");
    if (data_c) {
      this.ctx.fill(new Path2D(this.paths[data_c]));
    }
  }

  sub_svg(el: SVGSVGElement) {
    const x = parseFloat(el.getAttribute("x"));
    const y = parseFloat(el.getAttribute("y"));

    this.ctx.translate(x, y);
  }
}

export function create_canvas_from_svg(svg: SVGSVGElement) {
  console.time("draw");

  const div = document.createElement("div");
  div.appendChild(svg);

  const style = svg.getAttribute("style");
  const width = svg.getAttribute("width");
  const height = svg.getAttribute("height");
  // const [_initial_x, _initial_y, view_width, view_height] = svg.getAttribute(
  //   "viewBox",
  // ).split(" ");

  const canvas = document.createElement("canvas");
  const canvas_style = `${style} width: ${width}; height: ${height};`;

  canvas.setAttribute("style", canvas_style);
  const { ctx_width, ctx_height } = get_ctx_viewbox(svg);
  canvas.setAttribute("width", `${ctx_width}`);
  canvas.setAttribute("height", `${ctx_height}`);
  div.appendChild(canvas);
  document.body.appendChild(div);
  const ctx = canvas.getContext("2d");

  const math_canvas = new MathjaxSVGToCanvas();
  math_canvas.draw(ctx, svg);

  console.timeEnd("draw");
}

function get_ctx_viewbox(svg: SVGSVGElement) {
  const width = svg.getAttribute("width");
  const height = svg.getAttribute("height");
  const ctx_width = parseFloat(width.replace("ex", "")) * 24;
  const ctx_height = parseFloat(height.replace("ex", "")) * 24;

  console.log({ ctx_width, ctx_height })
  return { ctx_width, ctx_height };
}
