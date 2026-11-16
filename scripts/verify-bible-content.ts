import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bibleQuiz, bibleStudies } from "../lib/bible/learning-paths";

assert.equal(bibleStudies.length, 10, "Debe haber diez rutas bíblicas.");
assert.equal(new Set(bibleStudies.map((study) => study.slug)).size, bibleStudies.length, "Las rutas deben tener slugs únicos.");
for (const study of bibleStudies) {
  assert.ok(study.title.trim().length > 3, `Título vacío: ${study.slug}`);
  assert.ok(study.reference.trim().length > 2, `Referencia ausente: ${study.slug}`);
  assert.ok(study.summary.trim().length > 40, `Resumen muy corto: ${study.slug}`);
  assert.ok(study.learningGoals.length >= 3, `Faltan objetivos: ${study.slug}`);
  assert.ok(study.activity.trim().length > 20, `Falta actividad: ${study.slug}`);
}
assert.equal(bibleQuiz.length, 5, "El desafío debe contener cinco preguntas.");
assert.equal(new Set(bibleQuiz.map((question) => question.id)).size, bibleQuiz.length, "Las preguntas deben tener IDs únicos.");
for (const question of bibleQuiz) {
  assert.equal(question.options.length, 4, `La pregunta ${question.id} debe tener cuatro opciones.`);
  assert.ok(question.correctIndex >= 0 && question.correctIndex < question.options.length, `Respuesta inválida: ${question.id}`);
  assert.ok(question.reference.trim().length > 2, `Referencia ausente: ${question.id}`);
  assert.ok(question.explanation.trim().length > 20, `Explicación ausente: ${question.id}`);
}
const seed = await readFile(new URL("../prisma/seed.ts", import.meta.url), "utf8");
for (const slug of ["tunica-pastor-amable", "corona-sabiduria", "companero-leoncito-daniel", "jardin-eden-mini", "perla-parabola", "huellas-buen-samaritano"]) {
  assert.ok(seed.includes(slug), `Falta objeto bíblico en la tienda: ${slug}`);
}
console.log(`Bible content verified: ${bibleStudies.length} studies, ${bibleQuiz.length} quiz questions and 6 new store items.`);
