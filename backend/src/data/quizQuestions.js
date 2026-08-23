const { codingQuestions } = require("./quizQuestionsCoding");

const QUIZ_QUESTIONS = [...codingQuestions];

const byId = new Map(QUIZ_QUESTIONS.map((item) => [item.id, item]));

function getQuestionById(id) {
  return byId.get(id) ?? null;
}

function getQuestionsByIds(ids) {
  return ids.map((id) => getQuestionById(id)).filter(Boolean);
}

module.exports = {
  QUIZ_QUESTIONS,
  getQuestionById,
  getQuestionsByIds,
};
