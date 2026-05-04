'use client';

import { useState } from "react";
import MultiplicationVertical from "./components/MultiplicationVertical";
import DivisionVertical from "./components/DivisionVertical";

type ProblemType = "multiplication" | "division" | "random";

const PROBLEM_TYPE_OPTIONS: { key: ProblemType; label: string }[] = [
  { key: "multiplication", label: "乘法" },
  { key: "division", label: "除法" },
  { key: "random", label: "随机" },
];

type Problem =
  | { type: "multiplication"; a: number; b: number }
  | { type: "division"; dividend: number; divisor: number; quotient: number };

function generateProblem(problemType: ProblemType): Problem {
  const isMultiplication =
    problemType === "multiplication" ||
    (problemType === "random" && Math.random() < 0.5);

  if (isMultiplication) {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 100) + 1;
    return { type: "multiplication", a, b };
  } else {
    const divisor = Math.floor(Math.random() * 100) + 1;
    const quotient = Math.floor(Math.random() * 100) + 1;
    const dividend = divisor * quotient;
    return { type: "division", dividend, divisor, quotient };
  }
}

export default function Home() {
  const [problemType, setProblemType] = useState<ProblemType>("random");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerate = () => {
    setProblem(generateProblem(problemType));
    setShowAnswer(false);
  };

  const handleSolve = () => {
    if (problem) setShowAnswer(true);
  };

  const answer = problem
    ? problem.type === "multiplication"
      ? problem.a * problem.b
      : problem.quotient
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 标题栏 */}
      <div
        className="px-6 py-4 text-center text-white text-xl font-bold"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        乘除法竖式练习
      </div>

      {/* 控制区 */}
      <div style={{ background: "#f5f5fa", borderBottom: "1px solid #e5e7eb" }}>
        {/* 按钮行：类型选择 + 操作按钮 */}
        <div className="flex items-center justify-center gap-4 px-5 pt-4">
          {/* 类型选择组 */}
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl"
            style={{ background: "#e0e0ea" }}
          >
            {PROBLEM_TYPE_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setProblemType(key)}
                className="px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer transition-all"
                style={
                  problemType === key
                    ? { background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", boxShadow: "0 2px 6px rgba(102,126,234,0.4)" }
                    : { background: "#fff", color: "#666" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* 操作按钮组 */}
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
            style={{ background: "#e0e0ea" }}
          >
            <button
              onClick={handleGenerate}
              className="px-8 py-2.5 rounded-lg text-white text-sm font-bold border-none cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #43A047, #66BB6A)",
                boxShadow: "0 2px 8px rgba(67,160,71,0.3)",
              }}
            >
              出题
            </button>
            <button
              onClick={handleSolve}
              disabled={!problem}
              className="px-8 py-2.5 rounded-lg text-white text-sm font-bold border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #1E88E5, #42A5F5)",
                boxShadow: problem ? "0 2px 8px rgba(30,136,229,0.3)" : "none",
              }}
            >
              解答
            </button>
          </div>
        </div>

        {/* 题目行 */}
        <div className="px-5 py-4 text-center text-3xl font-bold text-gray-800">
          {problem ? (
            <>
              {problem.type === "multiplication"
                ? `${problem.a} × ${problem.b}`
                : `${problem.dividend} ÷ ${problem.divisor}`}
              {showAnswer && answer !== null && (
                <span>
                  {" "} = <span className="text-red-600">{answer}</span>
                </span>
              )}
              {!showAnswer && " = ?"}
            </>
          ) : (
            <span className="text-lg text-gray-400">点击「出题」开始练习</span>
          )}
        </div>
      </div>

      {/* 竖式展示区 */}
      <div className="flex-1 flex items-center justify-center overflow-visible">
        {showAnswer && problem ? (
          <div className="calc-scale">
            {problem.type === "multiplication" ? (
              <MultiplicationVertical a={problem.a} b={problem.b} />
            ) : (
              <DivisionVertical
                dividend={problem.dividend}
                divisor={problem.divisor}
                quotient={problem.quotient}
              />
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-2">📝</div>
            <div>点击「解答」按钮查看竖式过程</div>
          </div>
        )}
      </div>
    </div>
  );
}
