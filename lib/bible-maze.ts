export type MazeCell = "#" | "." | "S" | "E" | "*" | "~";
export type MazeDirection = "up" | "down" | "left" | "right";
export type MazePoint = { row: number; column: number };
export type MazeLayout = readonly string[];

export type BibleMazeLevel = {
  id: number;
  title: string;
  subtitle: string;
  teaching: string;
  objective: string;
  reward: { points: number; xp: number };
  layouts: readonly MazeLayout[];
};

// El contenido de cada ruta es inmutable y no depende de la interfaz. Así se
// podrá reutilizar con sincronización de varios jugadores en una fase futura.
export const bibleMazeLevels: readonly BibleMazeLevel[] = [
  {
    id: 1,
    title: "El camino de Noé",
    subtitle: "Encuentra el sendero seguro hacia el arca.",
    teaching: "Dar un paso con confianza puede empezar una gran aventura.",
    objective: "Recoge la luz y llega a la salida.",
    reward: { points: 90, xp: 35 },
    layouts: [
      ["S.*..", ".###.", "...#.", ".###.", "....E"],
      ["S#...", ".*.#.", "##.#.", "...#.", ".##.E"],
    ],
  },
  {
    id: 2,
    title: "El desierto de Moisés",
    subtitle: "Sigue las luces que guían el camino.",
    teaching: "La sabiduría nos ayuda a elegir la siguiente ruta.",
    objective: "Encuentra las señales luminosas y alcanza el campamento.",
    reward: { points: 110, xp: 45 },
    layouts: [
      ["S..#..", "##.#.#", ".*...#", ".###..", "....#.", "####.E"],
      ["S#....", ".#.##.", ".*....", ".####.", "......", "#####E"],
    ],
  },
  {
    id: 3,
    title: "El camino de David",
    subtitle: "Avanza con calma por el valle de las decisiones.",
    teaching: "La valentía también consiste en pensar con tranquilidad.",
    objective: "Reúne dos destellos y encuentra el pasaje final.",
    reward: { points: 130, xp: 55 },
    layouts: [
      ["S..#...", "##.#.#.", ".*...#.", ".#####.", "...#...", ".#.#.##", ".#*..E."],
      ["S#.....", ".#.###.", ".*...#.", ".###.#.", "...#...", ".#.#.##", ".#..*E."],
    ],
  },
  {
    id: 4,
    title: "El camino de Jerusalén",
    subtitle: "Cruza el bosque de las pruebas con amabilidad.",
    teaching: "Una buena decisión puede abrir caminos para todos.",
    objective: "Evita la niebla, reúne las luces y llega a la ciudad.",
    reward: { points: 150, xp: 65 },
    layouts: [
      ["S..#....", "##.#.##.", ".*...#..", ".###.#..", "...#.#..", ".#.#*..#", ".#.###.#", "....~..E"],
      ["S#......", ".#.####.", ".*....#.", ".####.#.", "....#.#.", ".##.#.*.", "...#...#", "###....E"],
    ],
  },
  {
    id: 5,
    title: "El jardín de los frutos",
    subtitle: "Busca las luces que hacen florecer el jardín.",
    teaching: "El amor, el gozo y la paciencia crecen cuando los cuidamos.",
    objective: "Encuentra tres destellos de los frutos y alcanza la puerta.",
    reward: { points: 170, xp: 75 },
    layouts: [
      ["S..#....", "##.#.##.", ".*...#..", ".###.#..", "...#*#..", ".#.#...#", ".#.###*#", "....~..E"],
      ["S#......", ".#.####.", ".*....#.", ".####.#.", "....#*#.", ".##.#.*.", "....###.", "###....E"],
    ],
  },
  {
    id: 6,
    title: "El camino de la fe",
    subtitle: "Mantente firme en un recorrido con más desvíos.",
    teaching: "La fe nos ayuda a seguir adelante incluso cuando el camino se complica.",
    objective: "Guarda los destellos de fe y encuentra la salida segura.",
    reward: { points: 200, xp: 90 },
    layouts: [
      ["S..#.....", "##.#.###.", ".*...#...", ".###.#.##", "...#*#...", ".#.#...#.", ".#...#.#.", ".###.#*#.", ".....~..E"],
      ["S#.......", ".#.#####.", ".*.....#.", ".#####.#.", ".....#*..", ".###.#.#.", "...#...#*", ".#.###.#.", ".......~E"],
    ],
  },
  {
    id: 7,
    title: "Gran Laberinto Final",
    subtitle: "El recorrido final reúne cada paso del viaje.",
    teaching: "Cada paso de fe, amor y esperanza ilumina el camino completo.",
    objective: "Supera el gran laberinto, reúne los destellos y celebra el final.",
    reward: { points: 260, xp: 120 },
    layouts: [
      ["S..#......", "##.#.####.", ".*...#....", ".###.#.##.", "...#*#....", ".#.#...##.", ".#...#....", ".###.#*##.", ".....~....", "#######..E"],
      ["S#........", ".#.######.", ".*......#.", ".######.#.", ".....#*...", ".###.#.##.", "...#...#..", ".#.###*...", ".#.....#..", ".#######E."],
    ],
  },
];

export function mazePointFor(layout: MazeLayout, symbol: "S" | "E"): MazePoint {
  for (let row = 0; row < layout.length; row += 1) {
    const column = layout[row].indexOf(symbol);
    if (column >= 0) return { row, column };
  }
  throw new Error(`El laberinto no incluye ${symbol}.`);
}

export function mazeTokenKeys(layout: MazeLayout) {
  return layout.flatMap((line, row) => [...line].flatMap((cell, column) => cell === "*" ? [`${row}-${column}`] : []));
}

export function mazeCellAt(layout: MazeLayout, point: MazePoint): MazeCell | undefined {
  return layout[point.row]?.[point.column] as MazeCell | undefined;
}

export function nextMazePoint(point: MazePoint, direction: MazeDirection): MazePoint {
  if (direction === "up") return { row: point.row - 1, column: point.column };
  if (direction === "down") return { row: point.row + 1, column: point.column };
  if (direction === "left") return { row: point.row, column: point.column - 1 };
  return { row: point.row, column: point.column + 1 };
}
