/**
 * Contenido diario determinista para que el nivel cambie sin que una IA
 * invente enseñanzas o datos bíblicos. La fecha se interpreta en Ecuador
 * continental, que es el horario de la plataforma.
 */
export type DailyBibleQuestion = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type DailyBibleChallenge = {
  id: string;
  dateKey: string;
  dateLabel: string;
  edition: number;
  icon: string;
  title: string;
  description: string;
  objective: string;
  verse: { reference: string; text: string };
  gameSlug: string;
  gameName: string;
  rewardXp: number;
  rewardPoints: number;
  questions: DailyBibleQuestion[];
};

type DailyTemplate = Omit<DailyBibleChallenge, "id" | "dateKey" | "dateLabel" | "edition">;

const dailyTemplates: readonly DailyTemplate[] = [
  { icon: "⛵", title: "La ruta del arca", description: "Descubre cómo Noé obedeció con paciencia y cuidado.", objective: "Completa tres pasos de la ruta del arca.", verse: { reference: "Génesis 6:22", text: "Noé hizo conforme a todo lo que Dios le mandó." }, gameSlug: "historias-biblicas-interactivas", gameName: "Historias Bíblicas Interactivas", rewardXp: 80, rewardPoints: 45, questions: [{ prompt: "¿Quién construyó un arca para cuidar a su familia y a los animales?", options: ["Noé", "David", "Jonás", "Pablo"], correct: 0, explanation: "Noé siguió las instrucciones de Dios y preparó el arca." }, { prompt: "¿Qué valor mostró Noé al completar una tarea larga?", options: ["Paciencia y obediencia", "Prisa", "Egoísmo", "Orgullo"], correct: 0, explanation: "Obedeció con perseverancia incluso cuando el trabajo tomó tiempo." }, { prompt: "¿Cómo podemos cuidar mejor la creación?", options: ["Con atención y responsabilidad", "Ensuciándola", "Ignorándola", "Desperdiciando agua"], correct: 0, explanation: "Cuidar lo que recibimos es una forma de agradecer." }] },
  { icon: "🪨", title: "Un paso valiente", description: "Recuerda la valentía tranquila de David ante un desafío grande.", objective: "Encuentra tres decisiones llenas de fe.", verse: { reference: "1 Samuel 17:45", text: "Yo vengo a ti en el nombre del Señor." }, gameSlug: "preguntas-de-aventura", gameName: "Preguntas Bíblicas", rewardXp: 80, rewardPoints: 45, questions: [{ prompt: "¿Quién confió en Dios antes de enfrentar a Goliat?", options: ["David", "Noé", "Moisés", "Daniel"], correct: 0, explanation: "David recordó que Dios estaba con él." }, { prompt: "Ser valiente también puede significar…", options: ["Hacer lo correcto con ayuda", "Actuar sin pensar", "Burlarse", "Rendirse siempre"], correct: 0, explanation: "La valentía no necesita lastimar ni presumir." }, { prompt: "Cuando algo cuesta, una buena idea es…", options: ["Pedir ayuda y dar un paso", "Esconderse sin hablar", "Echar la culpa", "Dejar de intentarlo"], correct: 0, explanation: "Podemos hablar con personas de confianza y avanzar con calma." }] },
  { icon: "🌊", title: "Camino entre las aguas", description: "Explora un camino de confianza inspirado en la historia de Moisés.", objective: "Ilumina tres señales de confianza.", verse: { reference: "Éxodo 14:13", text: "No temáis; estad firmes." }, gameSlug: "el-camino-del-rio", gameName: "El Camino del Río", rewardXp: 85, rewardPoints: 50, questions: [{ prompt: "¿Quién guió al pueblo de Israel fuera de Egipto?", options: ["Moisés", "Salomón", "Pedro", "Rut"], correct: 0, explanation: "Moisés fue llamado para guiar al pueblo." }, { prompt: "Cuando el camino parece difícil, podemos…", options: ["Confiar y buscar guía", "Tratar mal a otros", "Rendirnos sin hablar", "Inventar rumores"], correct: 0, explanation: "La confianza crece cuando buscamos una guía buena." }, { prompt: "¿Qué ayuda a un equipo a cruzar un reto?", options: ["Caminar juntos", "Dejar a alguien atrás", "Competir con enojo", "No escuchar"], correct: 0, explanation: "Los buenos equipos se cuidan y se escuchan." }] },
  { icon: "🌾", title: "Espigas de amistad", description: "Aprende sobre la lealtad y el cuidado en la historia de Rut.", objective: "Elige tres gestos de amistad fiel.", verse: { reference: "Rut 1:16", text: "Tu pueblo será mi pueblo." }, gameSlug: "guardianes-del-jardin", gameName: "Guardianes del Jardín", rewardXp: 75, rewardPoints: 45, questions: [{ prompt: "¿Qué valor se recuerda en la historia de Rut?", options: ["Lealtad", "Envidia", "Avaricia", "Burla"], correct: 0, explanation: "Rut acompañó y cuidó a Noemí." }, { prompt: "Una amistad buena puede…", options: ["Acompañar en momentos difíciles", "Exigir regalos", "Excluir", "Hacer sentir mal"], correct: 0, explanation: "Acompañar y escuchar son formas de cuidar." }, { prompt: "¿Qué gesto ayuda a alguien nuevo en un grupo?", options: ["Dar la bienvenida", "Ignorarlo", "Reírse", "Esconder sus cosas"], correct: 0, explanation: "Una bienvenida amable abre caminos de amistad." }] },
  { icon: "🦁", title: "Tiempo de oración", description: "Practica decisiones de confianza inspiradas en Daniel.", objective: "Completa tres recordatorios de confianza.", verse: { reference: "Daniel 6:10", text: "Daniel oraba y daba gracias delante de su Dios." }, gameSlug: "aprende-el-versiculo", gameName: "Aprende el Versículo", rewardXp: 85, rewardPoints: 50, questions: [{ prompt: "¿Qué hacía Daniel como parte de su rutina?", options: ["Oraba y daba gracias", "Se burlaba", "Ocultaba ayuda", "Dejaba de aprender"], correct: 0, explanation: "Daniel mantenía un tiempo de oración y gratitud." }, { prompt: "Dar gracias puede ayudarnos a…", options: ["Recordar lo bueno", "Olvidar a otros", "Ganar siempre", "Hablar con enojo"], correct: 0, explanation: "La gratitud nos ayuda a mirar con esperanza." }, { prompt: "¿Con quién puedes hablar cuando necesitas ayuda?", options: ["Con Dios y un adulto de confianza", "Con desconocidos en internet", "Con nadie", "Solo con rumores"], correct: 0, explanation: "Pedir apoyo a personas seguras es una decisión sabia." }] },
  { icon: "🍞", title: "Manos que sirven", description: "Sigue el ejemplo de Jesús al servir con alegría.", objective: "Reconoce tres formas de servir.", verse: { reference: "Marcos 10:45", text: "El Hijo del Hombre no vino para ser servido, sino para servir." }, gameSlug: "historias-biblicas-interactivas", gameName: "Historias Bíblicas Interactivas", rewardXp: 80, rewardPoints: 45, questions: [{ prompt: "Jesús enseñó que una persona grande puede…", options: ["Servir a otros", "Mandar con orgullo", "Ignorar necesidades", "Burlarse"], correct: 0, explanation: "Servir con amor es una forma de liderazgo." }, { prompt: "¿Cuál es una forma sencilla de servir en casa?", options: ["Ayudar con una tarea", "Dejar desorden", "Esconder cosas", "Responder mal"], correct: 0, explanation: "Las pequeñas ayudas también cuentan." }, { prompt: "Cuando colaboramos, el equipo…", options: ["Puede avanzar mejor", "Debe pelear", "No necesita escucharse", "Pierde la esperanza"], correct: 0, explanation: "Colaborar hace más ligero el camino." }] },
  { icon: "🩹", title: "El camino del buen samaritano", description: "Descubre decisiones de cuidado y compasión.", objective: "Elige tres acciones que cuidan al prójimo.", verse: { reference: "Lucas 10:33", text: "Tuvo compasión de él." }, gameSlug: "el-camino-del-rio", gameName: "El Camino del Río", rewardXp: 85, rewardPoints: 50, questions: [{ prompt: "¿Qué hizo el buen samaritano al ver a alguien herido?", options: ["Lo ayudó", "Se burló", "Lo ignoró", "Le quitó cosas"], correct: 0, explanation: "Se detuvo para cuidar y buscar ayuda." }, { prompt: "Compasión significa…", options: ["Cuidar a quien lo necesita", "Ganar una carrera", "Tener más cosas", "No escuchar"], correct: 0, explanation: "La compasión se nota en acciones amables." }, { prompt: "Si alguien se siente solo, puedes…", options: ["Invitarlo y hablar con amabilidad", "Excluirlo", "Reírte", "Contar un secreto"], correct: 0, explanation: "Una invitación amable puede cambiar un día." }] },
  { icon: "🍇", title: "Frutos que dan luz", description: "Reconoce actitudes que hacen bien a la comunidad.", objective: "Encuentra tres frutos del Espíritu.", verse: { reference: "Gálatas 5:22", text: "El fruto del Espíritu es amor, gozo, paz." }, gameSlug: "guardianes-del-jardin", gameName: "Guardianes del Jardín", rewardXp: 80, rewardPoints: 45, questions: [{ prompt: "¿Cuál es un fruto del Espíritu?", options: ["Amor", "Enojo sin control", "Burla", "Egoísmo"], correct: 0, explanation: "Amor, gozo y paz son ejemplos de frutos del Espíritu." }, { prompt: "La paciencia nos ayuda a…", options: ["Esperar con calma", "Empujar a otros", "Rendirse de inmediato", "Gritar"], correct: 0, explanation: "Esperar con calma puede ayudar a tomar mejores decisiones." }, { prompt: "El dominio propio sirve para…", options: ["Elegir una buena respuesta", "Hacer daño", "Ignorar límites", "Decir cualquier cosa"], correct: 0, explanation: "Podemos pausar y escoger una respuesta amable." }] },
  { icon: "📜", title: "Palabras que animan", description: "Conecta una carta de Pablo con gestos de ánimo.", objective: "Completa tres mensajes de esperanza.", verse: { reference: "1 Tesalonicenses 5:11", text: "Animaos unos a otros." }, gameSlug: "sopa-de-letras-biblica", gameName: "Sopa de Letras Bíblica", rewardXp: 75, rewardPoints: 45, questions: [{ prompt: "Pablo animaba a las comunidades por medio de…", options: ["Cartas", "Juegos de guerra", "Secretos", "Burlas"], correct: 0, explanation: "Las cartas ayudaban a enseñar y animar." }, { prompt: "Una frase que anima a un compañero es…", options: ["¡Tú puedes!", "No sirves", "Vete", "No intentes"], correct: 0, explanation: "Las palabras amables pueden dar esperanza." }, { prompt: "¿Qué hace una comunidad fuerte?", options: ["Animarse y cuidarse", "Competir con enojo", "Guardar rencor", "Excluir"], correct: 0, explanation: "Cuidarnos nos ayuda a crecer juntos." }] },
  { icon: "🌍", title: "Cuidamos el jardín", description: "Recorre un nivel sobre la creación y el cuidado responsable.", objective: "Ilumina tres decisiones de cuidado.", verse: { reference: "Génesis 2:15", text: "Lo puso en el huerto de Edén, para que lo labrara y lo guardase." }, gameSlug: "colorear-biblico", gameName: "Colorear Bíblico", rewardXp: 75, rewardPoints: 45, questions: [{ prompt: "¿Qué podemos hacer por la creación?", options: ["Cuidarla", "Desperdiciarla", "Ensuciarla", "Ignorarla"], correct: 0, explanation: "Cuidar agua, plantas y animales es una respuesta responsable." }, { prompt: "Una acción responsable es…", options: ["Recoger la basura", "Tirar papeles al suelo", "Desperdiciar agua", "Romper plantas"], correct: 0, explanation: "Las acciones pequeñas pueden cuidar un lugar compartido." }, { prompt: "¿Qué puede crecer con cuidado?", options: ["Una semilla", "Una burla", "Un desperdicio", "Un rumor"], correct: 0, explanation: "Una semilla necesita tiempo, agua y cuidado." }] },
  { icon: "💡", title: "Una decisión sabia", description: "Descubre consejos sencillos inspirados en Proverbios.", objective: "Resuelve tres decisiones sabias.", verse: { reference: "Proverbios 3:5", text: "Fíate de Jehová de todo tu corazón." }, gameSlug: "iq-biblico", gameName: "IQ Bíblico", rewardXp: 85, rewardPoints: 50, questions: [{ prompt: "Antes de decidir algo importante, es bueno…", options: ["Pensar y pedir consejo", "Actuar con prisa", "Copiar a cualquiera", "Esconderlo"], correct: 0, explanation: "Pensar con calma y buscar ayuda es sabio." }, { prompt: "Una respuesta amable puede…", options: ["Calmar una conversación", "Empeorar todo", "No importar", "Ser una debilidad"], correct: 0, explanation: "La amabilidad puede abrir un mejor diálogo." }, { prompt: "¿Qué ayuda a aprender?", options: ["Escuchar con atención", "Interrumpir siempre", "Reírse de errores", "No preguntar"], correct: 0, explanation: "Las preguntas respetuosas nos ayudan a crecer." }] },
  { icon: "👑", title: "Una voz valiente", description: "Recuerda cómo Ester usó su voz para cuidar a su pueblo.", objective: "Completa tres pasos de valentía amable.", verse: { reference: "Ester 4:14", text: "¿Y quién sabe si para esta hora has llegado al reino?" }, gameSlug: "preguntas-de-aventura", gameName: "Preguntas Bíblicas", rewardXp: 85, rewardPoints: 50, questions: [{ prompt: "Ester usó su posición para…", options: ["Ayudar a su pueblo", "Presumir", "Excluir", "Guardar silencio por orgullo"], correct: 0, explanation: "Ester buscó una forma valiente y respetuosa de ayudar." }, { prompt: "Usar bien tu voz puede ser…", options: ["Pedir ayuda ante una injusticia", "Difundir rumores", "Insultar", "Callar un peligro"], correct: 0, explanation: "Hablar con un adulto de confianza puede proteger." }, { prompt: "La valentía amable incluye…", options: ["Respetar y cuidar", "Lastimar", "Burlarse", "Amenazar"], correct: 0, explanation: "La valentía no necesita dañar a otros." }] },
  { icon: "🐋", title: "Volver al buen camino", description: "Aprende sobre la obediencia y las nuevas oportunidades con Jonás.", objective: "Encuentra tres pasos para volver a intentarlo.", verse: { reference: "Jonás 3:1", text: "Vino palabra de Jehová por segunda vez a Jonás." }, gameSlug: "mapa-de-estrellas", gameName: "Mapa de Estrellas", rewardXp: 80, rewardPoints: 45, questions: [{ prompt: "¿Quién recibió una segunda oportunidad para obedecer?", options: ["Jonás", "Goliat", "Sansón", "Faraón"], correct: 0, explanation: "Jonás recibió de nuevo la misión de ir a Nínive." }, { prompt: "Si cometemos un error, podemos…", options: ["Reconocerlo y volver a intentarlo", "Ocultarlo siempre", "Culpar a otros", "Rendirnos"], correct: 0, explanation: "Aprender de un error ayuda a crecer." }, { prompt: "Una buena forma de reparar es…", options: ["Pedir perdón y actuar mejor", "Reírse", "Negarlo", "Hacerlo otra vez"], correct: 0, explanation: "Pedir perdón y cambiar la acción demuestra cuidado." }] },
  { icon: "🐑", title: "Sendero de paz", description: "Cierra el nivel con imágenes de cuidado del Salmo 23.", objective: "Completa tres señales de paz.", verse: { reference: "Salmo 23:1", text: "Jehová es mi pastor; nada me faltará." }, gameSlug: "vocales-de-luz", gameName: "Vocales de Luz", rewardXp: 70, rewardPoints: 40, questions: [{ prompt: "El Salmo 23 compara a Dios con un…", options: ["Pastor", "Capitán de barco", "Rey de un juego", "Comerciante"], correct: 0, explanation: "La imagen del pastor habla de cuidado y guía." }, { prompt: "¿Qué puede traer paz a un momento difícil?", options: ["Respirar, orar y pedir apoyo", "Gritar", "Empujar", "Aislarse"], correct: 0, explanation: "Podemos hacer una pausa y hablar con alguien seguro." }, { prompt: "Cuidar a otros puede verse como…", options: ["Acompañar y escuchar", "Excluir", "Burlarse", "Ignorar"], correct: 0, explanation: "Escuchar es una forma de acompañar." }] },
];

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "01";
  return { year: Number(pick("year")), month: Number(pick("month")), day: Number(pick("day")) };
}

function serialFor({ year, month, day }: ReturnType<typeof dateParts>) {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** Fecha canónica de la plataforma (Ecuador continental) para misiones y cron. */
export function dailyBibleDateKey(date = new Date()) {
  const { year, month, day } = dateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function reorderQuestion(question: DailyBibleQuestion, seed: number): DailyBibleQuestion {
  const order = question.options.map((_, index) => index);
  let value = Math.max(1, seed);
  for (let index = order.length - 1; index > 0; index -= 1) {
    value = (value * 9301 + 49297) % 233280;
    const swap = Math.floor((value / 233280) * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { ...question, options: order.map((index) => question.options[index]), correct: order.indexOf(question.correct) };
}

export function dailyBibleChallengeFor(date = new Date()): DailyBibleChallenge {
  const parts = dateParts(date);
  const serial = serialFor(parts);
  const template = dailyTemplates[((serial % dailyTemplates.length) + dailyTemplates.length) % dailyTemplates.length];
  const dateKey = dailyBibleDateKey(date);
  return {
    ...template,
    id: `nivel-diario-${dateKey}`,
    dateKey,
    dateLabel: new Intl.DateTimeFormat("es-EC", { timeZone: "America/Guayaquil", weekday: "long", day: "numeric", month: "long" }).format(date),
    edition: Math.floor(serial / dailyTemplates.length) + 1,
    questions: template.questions.map((question, index) => reorderQuestion(question, serial + index * 97)),
  };
}
