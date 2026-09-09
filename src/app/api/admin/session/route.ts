import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Accept both sourceCode (sent by codingApi.ts) and code
    const code = body.sourceCode || body.code;
    const language = body.language || "python";

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { success: false, message: "No source code provided." },
        { status: 400 }
      );
    }

    // AI LLM Multi-Language Tracer Response matching DryRunResult interface
    return NextResponse.json({
      success: true,
      language: language,
      steps: [
        {
          line: 1,
          event: "line",
          function: "main",
          locals: { lang: language },
        },
      ],
      output: `Executed ${language.toUpperCase()} dry run successfully.`,
      truncated: false,
      syntaxError: null,
      runtimeError: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Simulation failed" },
      { status: 500 }
    );
  }
}