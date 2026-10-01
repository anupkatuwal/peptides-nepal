import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { quizQuestions, navigateTo } = useStore();
  const [userAnswers, setUserAnswers] = useState<Record<string, 'myth' | 'fact'>>({});

  const handleSelectAnswer = (questionId: string, answer: 'myth' | 'fact') => {
    if (userAnswers[questionId]) return; // already answered
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = quizQuestions.filter(q => userAnswers[q.id] === q.answer).length;

  const handleReset = () => {
    setUserAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4EBE7] text-[#0E2A23] text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-[#4B635A]" />
          <span>Scientific Fact-Checking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0E2A23] tracking-tight">
          Peptide Myth or Fact Quiz
        </h1>
        <p className="text-sm sm:text-base text-[#4B635A] leading-relaxed">
          Test your knowledge against common internet peptide myths, regulatory half-truths, and clinical realities.
        </p>

        {/* Progress & Score Pill */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <span className="px-3.5 py-1 rounded-full bg-white border border-[#CBD5CF] text-xs font-bold text-[#0E2A23]">
            Answered: {answeredCount} / {quizQuestions.length}
          </span>
          {answeredCount > 0 && (
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-black text-emerald-800">
              Score: {correctCount} Correct
            </span>
          )}
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="space-y-6">
        {quizQuestions.map((q, idx) => {
          const userAns = userAnswers[q.id];
          const isAnswered = !!userAns;
          const isCorrect = userAns === q.answer;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-300 shadow-md bg-emerald-50/20'
                    : 'border-red-300 shadow-md bg-red-50/20'
                  : 'border-[#CBD5CF] shadow-xs'
              }`}
            >
              {/* Question Number */}
              <div className="flex items-center justify-between text-xs font-bold text-[#4B635A] mb-3">
                <span>Statement #{idx + 1}</span>
                {isAnswered && (
                  <span className={`flex items-center gap-1 font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Incorrect
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Statement */}
              <h3 className="text-lg sm:text-xl font-bold text-[#0E2A23] leading-snug mb-5">
                "{q.statement}"
              </h3>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  disabled={isAnswered}
                  onClick={() => handleSelectAnswer(q.id, 'myth')}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    isAnswered
                      ? q.answer === 'myth'
                        ? 'bg-emerald-700 text-white font-black'
                        : userAns === 'myth'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-400 opacity-60'
                      : 'bg-[#F2F5F3] hover:bg-[#E4EBE7] text-[#0E2A23] border border-[#CBD5CF]'
                  }`}
                >
                  Myth
                </button>

                <button
                  disabled={isAnswered}
                  onClick={() => handleSelectAnswer(q.id, 'fact')}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    isAnswered
                      ? q.answer === 'fact'
                        ? 'bg-emerald-700 text-white font-black'
                        : userAns === 'fact'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-400 opacity-60'
                      : 'bg-[#F2F5F3] hover:bg-[#E4EBE7] text-[#0E2A23] border border-[#CBD5CF]'
                  }`}
                >
                  Fact
                </button>
              </div>

              {/* Explanation Reveal */}
              {isAnswered && (
                <div className="mt-5 pt-4 border-t border-gray-200 space-y-2 animate-in fade-in duration-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      Answer: This statement is a{' '}
                      <strong className={`uppercase ${q.answer === 'fact' ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {q.answer}
                      </strong>.
                    </span>
                  </div>
                  <p className="text-[#4B635A] leading-relaxed">
                    {q.explanation}
                  </p>
                  <p className="text-[11px] text-gray-400 italic">
                    Source: {q.reference}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Score Card */}
      {answeredCount === quizQuestions.length && (
        <div className="bg-[#0E2A23] rounded-3xl p-8 text-white text-center space-y-4 shadow-xl animate-in zoom-in-95">
          <Award className="w-12 h-12 text-[#E3A81B] mx-auto" />
          <h2 className="text-2xl font-black">
            Quiz Complete! You scored {correctCount} / {quizQuestions.length}
          </h2>
          <p className="text-sm text-[#B9C7BF] max-w-md mx-auto">
            {correctCount >= 7
              ? "Exceptional! You have a keen scientific eye for identifying peptide hype and reading research accurately."
              : "Great effort! Peptide marketing can be confusing. Revisit our plain-language research guide to review clinical trial evidence."}
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="px-6 py-2.5 rounded-full bg-[#E3A81B] hover:bg-[#E3A81B] text-[#0A1F19] font-black text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Explore Verified Peptides</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
