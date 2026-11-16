import { ContentStatus, Difficulty, GameType, InventoryItemType, ItemRarity, MissionStatus, PrismaClient, ScorePeriod, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const categoryData = [
  { id: "cat-memory", name: "Memoria", slug: "memoria", description: "Retos para recordar y relacionar.", icon: "✦", sortOrder: 1 },
  { id: "cat-quiz", name: "Preguntas", slug: "preguntas", description: "Desafíos de conocimiento y curiosidad.", icon: "?", sortOrder: 2 },
  { id: "cat-arcade", name: "Arcade", slug: "arcade", description: "Retos dinámicos y de exploración.", icon: "↗", sortOrder: 3 },
  { id: "cat-adventures", name: "Aventuras", slug: "aventuras", description: "Historias interactivas por capítulos.", icon: "⌁", sortOrder: 4 },
  { id: "cat-values", name: "Valores", slug: "valores", description: "Historias para practicar buenos valores.", icon: "♥", sortOrder: 5 },
  { id: "cat-words", name: "Palabras", slug: "palabras", description: "Retos de palabras y conceptos bíblicos.", icon: "⌕", sortOrder: 6 },
  { id: "cat-creativity", name: "Creatividad", slug: "creatividad", description: "Actividades para crear y explorar.", icon: "◌", sortOrder: 7 },
  { id: "cat-stories", name: "Historias", slug: "historias", description: "Relatos con decisiones y actividades.", icon: "▤", sortOrder: 8 },
  { id: "cat-logic", name: "Lógica", slug: "logica", description: "Patrones, secuencias y acertijos.", icon: "◈", sortOrder: 9 },
  { id: "cat-verses", name: "Versículos", slug: "versiculos", description: "Práctica para recordar palabras de vida.", icon: "¶", sortOrder: 10 },
  { id: "cat-puzzles", name: "Rompecabezas", slug: "rompecabezas", description: "Escenas para ordenar pieza por pieza.", icon: "▦", sortOrder: 11 },
];

const gameData = [
  { id: "game-little-big-heroes", slug: "little-big-heroes-run-hero-run", name: "Little Big Heroes: Run Hero Run!", shortDescription: "Corre, salta y rescata ovejitas mientras aprendes las vocales.", categoryId: "cat-arcade", suggestedAgeMin: 4, suggestedAgeMax: 9, difficulty: Difficulty.INITIAL, maxPoints: 900, xpReward: 160, moduleKey: "little-big-heroes", featured: true },
  { id: "game-memory", slug: "memoria-biblica", name: "Memoria bíblica", shortDescription: "Une cartas de historias y símbolos para iluminar el sendero.", categoryId: "cat-memory", suggestedAgeMin: 6, suggestedAgeMax: 10, difficulty: Difficulty.INITIAL, maxPoints: 320, xpReward: 100, moduleKey: "memory", featured: true },
  { id: "game-quiz", slug: "preguntas-de-aventura", name: "Preguntas bíblicas", shortDescription: "Responde preguntas, descubre explicaciones y abre nuevas rutas.", categoryId: "cat-quiz", suggestedAgeMin: 7, suggestedAgeMax: 12, difficulty: Difficulty.EXPLORER, maxPoints: 450, xpReward: 130, moduleKey: "quiz", featured: true },
  { id: "game-light", slug: "recolector-de-luz", name: "Recolector de luz", shortDescription: "Ayuda a Lumo a recoger destellos y evitar nubes traviesas.", categoryId: "cat-arcade", suggestedAgeMin: 8, suggestedAgeMax: 13, difficulty: Difficulty.ADVENTURER, maxPoints: 600, xpReward: 160, moduleKey: "light-collector", featured: true },
  { id: "game-garden", slug: "guardianes-del-jardin", name: "Guardianes del jardín", shortDescription: "Cuida semillas y comparte la cosecha.", categoryId: "cat-values", suggestedAgeMin: 5, suggestedAgeMax: 9, difficulty: Difficulty.INITIAL, maxPoints: 280, xpReward: 90, moduleKey: "garden-helpers", featured: false },
  { id: "game-river", slug: "el-camino-del-rio", name: "El camino del río", shortDescription: "Elige rutas amables para llevar provisiones al campamento.", categoryId: "cat-adventures", suggestedAgeMin: 7, suggestedAgeMax: 12, difficulty: Difficulty.EXPLORER, maxPoints: 400, xpReward: 120, moduleKey: "river-path", featured: false },
  { id: "game-stars", slug: "mapa-de-estrellas", name: "Mapa de estrellas", shortDescription: "Conecta constelaciones y orienta la expedición nocturna.", categoryId: "cat-adventures", suggestedAgeMin: 7, suggestedAgeMax: 12, difficulty: Difficulty.EXPLORER, maxPoints: 360, xpReward: 110, moduleKey: "star-map", featured: false },
  { id: "game-maze", slug: "laberinto-biblico", name: "Laberinto Bíblico", shortDescription: "Recorre siete laberintos y encuentra rutas de esperanza.", categoryId: "cat-adventures", suggestedAgeMin: 6, suggestedAgeMax: 13, difficulty: Difficulty.ADVENTURER, maxPoints: 1110, xpReward: 485, moduleKey: "bible-maze", featured: true },
  { id: "game-word-search", slug: "sopa-de-letras-biblica", name: "Sopa de Letras Bíblica", shortDescription: "Encuentra palabras de historias bíblicas en tableros progresivos.", categoryId: "cat-words", suggestedAgeMin: 6, suggestedAgeMax: 12, difficulty: Difficulty.INITIAL, maxPoints: 360, xpReward: 90, moduleKey: "word-search", featured: false },
  { id: "game-coloring", slug: "colorear-biblico", name: "Colorear Bíblico", shortDescription: "Pinta una escena original y guarda tu creación.", categoryId: "cat-creativity", suggestedAgeMin: 4, suggestedAgeMax: 10, difficulty: Difficulty.INITIAL, maxPoints: 280, xpReward: 70, moduleKey: "coloring", featured: false },
  { id: "game-stories", slug: "historias-biblicas-interactivas", name: "Historias Bíblicas Interactivas", shortDescription: "Lee capítulos, toma decisiones y responde retos.", categoryId: "cat-stories", suggestedAgeMin: 6, suggestedAgeMax: 12, difficulty: Difficulty.EXPLORER, maxPoints: 430, xpReward: 130, moduleKey: "story", featured: false },
  { id: "game-iq", slug: "iq-biblico", name: "IQ Bíblico", shortDescription: "Resuelve patrones, secuencias y acertijos apropiados para tu nivel.", categoryId: "cat-logic", suggestedAgeMin: 7, suggestedAgeMax: 13, difficulty: Difficulty.EXPLORER, maxPoints: 390, xpReward: 110, moduleKey: "iq", featured: false },
  { id: "game-verse", slug: "aprende-el-versiculo", name: "Aprende el Versículo", shortDescription: "Estudia un versículo y supera retos para recordarlo.", categoryId: "cat-verses", suggestedAgeMin: 6, suggestedAgeMax: 13, difficulty: Difficulty.EXPLORER, maxPoints: 350, xpReward: 120, moduleKey: "verse", featured: false },
  { id: "game-puzzle", slug: "rompecabezas-biblico", name: "Rompecabezas Bíblico", shortDescription: "Ordena piezas de una ilustración original.", categoryId: "cat-puzzles", suggestedAgeMin: 6, suggestedAgeMax: 13, difficulty: Difficulty.ADVENTURER, maxPoints: 500, xpReward: 140, moduleKey: "puzzle", featured: false },
  { id: "game-vowels", slug: "vocales-de-luz", name: "Vocales de luz", shortDescription: "Escucha, repite y descubre A, E, I, O, U.", categoryId: "cat-words", suggestedAgeMin: 2, suggestedAgeMax: 5, difficulty: Difficulty.INITIAL, maxPoints: 150, xpReward: 60, moduleKey: "vowels", featured: true },
];

const storeData = [
  { slug: "marco-del-amanecer", name: "Marco del amanecer", description: "Un marco cosmético para celebrar tus primeras aventuras.", type: InventoryItemType.COSMETIC, rarity: ItemRarity.COMMON, coinPrice: 40, criteria: { minLevel: 1 } },
  { slug: "estela-de-destellos", name: "Estela de destellos", description: "Un efecto de colección para futuras pantallas de recompensa.", type: InventoryItemType.EFFECT, rarity: ItemRarity.UNCOMMON, coinPrice: 90, criteria: { minLevel: 2 } },
  { slug: "sendero-de-estrellas", name: "Sendero de estrellas", description: "Un escenario de colección para los mapas que se ampliarán más adelante.", type: InventoryItemType.SCENERY, rarity: ItemRarity.RARE, coinPrice: 160, criteria: { minLevel: 3 } },
  { slug: "mapa-de-explorador", name: "Mapa de explorador", description: "Contenido especial que recuerda tus recorridos de aventura.", type: InventoryItemType.SPECIAL_CONTENT, rarity: ItemRarity.UNCOMMON, coinPrice: 120, criteria: { minLevel: 2 } },

  { slug: "yelmo-salvacion", name: "Yelmo de la salvación", description: "Un adorno de perfil inspirado en la esperanza de Efesios 6.", type: InventoryItemType.COSMETIC, rarity: ItemRarity.UNCOMMON, coinPrice: 110, criteria: { minLevel: 2 } },
  { slug: "escudo-fe", name: "Emblema del escudo de la fe", description: "Un emblema luminoso para tu perfil, inspirado en Efesios 6:16.", type: InventoryItemType.COSMETIC, rarity: ItemRarity.RARE, coinPrice: 180, criteria: { minLevel: 4 } },
  { slug: "capa-bondad", name: "Capa de la bondad", description: "Una capa decorativa que celebra el servicio y el amor al prójimo.", type: InventoryItemType.CHARACTER_STYLE, rarity: ItemRarity.UNCOMMON, coinPrice: 130, criteria: { minLevel: 2 } },
  { slug: "aureola-olivo", name: "Brillo de olivo", description: "Un efecto visual sereno inspirado en la paz.", type: InventoryItemType.EFFECT, rarity: ItemRarity.RARE, coinPrice: 210, criteria: { minLevel: 5 } },
  { slug: "estandarte-jerico", name: "Estandarte de Jericó", description: "Decoración de colección que recuerda la historia de Josué 6.", type: InventoryItemType.SCENERY, rarity: ItemRarity.RARE, coinPrice: 240, criteria: { minLevel: 5 } },
  { slug: "portal-mar-rojo", name: "Portal del Mar Rojo", description: "Un fondo de perfil inspirado en el camino de esperanza de Éxodo 14.", type: InventoryItemType.SCENERY, rarity: ItemRarity.EPIC, coinPrice: 320, criteria: { minLevel: 8 } },
  { slug: "companero-paloma", name: "Compañera paloma", description: "Un compañero decorativo que simboliza la paz y la guía.", type: InventoryItemType.AVATAR, rarity: ItemRarity.EPIC, coinPrice: 360, criteria: { minLevel: 8 } },
  { slug: "pergamino-sabiduria", name: "Pergamino de sabiduría", description: "Una pieza de colección con referencias para seguir aprendiendo Proverbios.", type: InventoryItemType.SPECIAL_CONTENT, rarity: ItemRarity.UNCOMMON, coinPrice: 95, criteria: { minLevel: 2 } },
];

async function main() {
  for (const category of categoryData) {
    await prisma.gameCategory.upsert({ where: { slug: category.slug }, update: category, create: category });
  }
  for (const game of gameData) {
    await prisma.game.upsert({ where: { slug: game.slug }, update: { ...game, gameType: GameType.INTERNAL, status: ContentStatus.PUBLISHED, publishedAt: new Date() }, create: { ...game, gameType: GameType.INTERNAL, status: ContentStatus.PUBLISHED, publishedAt: new Date() } });
  }
  for (const item of storeData) {
    await prisma.storeItem.upsert({ where: { slug: item.slug }, update: item, create: item });
  }

  const mission = await prisma.mission.upsert({
    where: { slug: "enciende-tres-balizas" },
    update: { title: "Enciende tres balizas", status: MissionStatus.ACTIVE },
    create: { slug: "enciende-tres-balizas", title: "Enciende tres balizas", description: "Responde con sabiduría para guiar a la expedición.", startsAt: new Date(), objective: { type: "quiz_correct_answers", target: 3 }, xpReward: 150, pointsReward: 75, status: MissionStatus.ACTIVE, gameId: "game-quiz" },
  });

  const achievementData = [
    { slug: "primera-aventura", title: "Primera aventura", description: "Completa tu primer juego.", icon: "🧭", criteria: { completedGames: 1 }, xpReward: 50, active: true },
    { slug: "explorador-curioso", title: "Explorador curioso", description: "Prueba 3 juegos diferentes.", icon: "🗺️", criteria: { uniqueGames: 3 }, xpReward: 75, active: true },
    { slug: "guardian-de-versiculos", title: "Guardián de palabras", description: "Aprende tu primer versículo.", icon: "📖", criteria: { learnedVerses: 1 }, xpReward: 50, active: true },
    { slug: "luz-constante", title: "Luz constante", description: "Mantén una racha de 3 días.", icon: "🌟", criteria: { activeDays: 3 }, xpReward: 75, active: true },
    { slug: "maestro-de-juegos", title: "Maestro de juegos", description: "Completa 8 partidas.", icon: "🏆", criteria: { completedGames: 8 }, xpReward: 100, active: true },
  ];
  for (const achievement of achievementData) await prisma.achievement.upsert({ where: { slug: achievement.slug }, update: achievement, create: achievement });
  await prisma.achievement.updateMany({
    where: { slug: { in: ["cinco-juegos", "siete-dias", "maestro-preguntas"] } },
    data: { active: false },
  });

  const adventure = await prisma.adventure.upsert({ where: { slug: "valle-de-los-destellos" }, update: { status: ContentStatus.PUBLISHED, featured: true }, create: { slug: "valle-de-los-destellos", title: "El valle de los destellos", summary: "Una expedición para devolver la luz a las aldeas del valle.", status: ContentStatus.PUBLISHED, featured: true, publishedAt: new Date() } });
  const chapters = ["La señal en el mapa", "El puente de la confianza", "La luz compartida", "Una decisión valiente", "El camino a casa", "El faro despierta"];
  for (const [index, title] of chapters.entries()) await prisma.adventureChapter.upsert({ where: { adventureId_chapterNumber: { adventureId: adventure.id, chapterNumber: index + 1 } }, update: { title }, create: { adventureId: adventure.id, chapterNumber: index + 1, title } });
  for (const [index, game] of gameData.slice(0, 3).entries()) await prisma.adventureGame.upsert({ where: { adventureId_gameId: { adventureId: adventure.id, gameId: game.id } }, update: { sortOrder: index + 1 }, create: { adventureId: adventure.id, gameId: game.id, sortOrder: index + 1 } });

  const demoPlayers = ["SolExplorador", "LunaBrilla", "NicoRio", "AuriMapa", "TeoValiente"];
  for (const [index, nickname] of demoPlayers.entries()) {
    const user = await prisma.user.upsert({ where: { email: `demo-${index + 1}@example.invalid` }, update: {}, create: { email: `demo-${index + 1}@example.invalid`, role: UserRole.PLAYER } });
    await prisma.profile.upsert({ where: { userId: user.id }, update: { nickname, avatarKey: ["fox", "owl", "otter", "butterfly", "bear"][index], points: 2480 - index * 160, totalXp: 1100 - index * 95, level: 5 - Math.min(index, 3) }, create: { userId: user.id, nickname, avatarKey: ["fox", "owl", "otter", "butterfly", "bear"][index], points: 2480 - index * 160, totalXp: 1100 - index * 95, level: 5 - Math.min(index, 3) } });
    const existingScore = await prisma.score.findFirst({ where: { userId: user.id, period: ScorePeriod.WEEKLY, periodKey: "demo-week-1" } });
    if (!existingScore) await prisma.score.create({ data: { userId: user.id, gameId: "game-quiz", points: 2480 - index * 160, period: ScorePeriod.WEEKLY, periodKey: "demo-week-1", source: "development-seed" } });
  }

  await prisma.siteSetting.upsert({ where: { key: "level-config" }, update: {}, create: { key: "level-config", value: [{ level: 1, title: "Explorador", xpRequired: 0 }, { level: 5, title: "Aventurero", xpRequired: 1000 }, { level: 10, title: "Guardián", xpRequired: 3000 }, { level: 20, title: "Héroe de la Fe", xpRequired: 8000 }] } });
  console.log(`Seed listo: ${categoryData.length} categorías, ${gameData.length} juegos, 1 misión (${mission.slug}) y datos ficticios.`);
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
