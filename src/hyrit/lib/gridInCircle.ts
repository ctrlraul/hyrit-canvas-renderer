type Vector = { x: number, y: number };

function getPoint (gridLine: number, radius: number): Vector {
  return {
    x: gridLine,
    y: Math.sqrt(radius ** 2 - gridLine ** 2)
  };
}

function swap (vector: Vector): Vector {
  return {
    x: vector.y,
    y: vector.x,
  };
}

export function gridInCircle (radius: number, tileSize: number): [Vector, Vector][] {

  const lines: [Vector, Vector][] = [];
  const offset = radius - (radius + tileSize * Math.ceil(radius / tileSize));
  
  for (let i = 1; i <= radius / tileSize * 2 + 1; i++) {

    // Vertical
    const p1 = getPoint(i * tileSize + offset, radius);
    const p2 = { ...p1 };
    p2.y *= -1;

    // Horizontal
    const p3 = swap(p1);
    const p4 = swap(p2);

    lines.push([p1, p2], [p3, p4]);

  }

  return lines;

}
