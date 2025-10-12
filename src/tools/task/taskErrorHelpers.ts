type CommonErrorPayload = {
  message: string;
  errorCode?: string;
  details?: string[];
};

function buildErrorMarkdown({ message, details }: CommonErrorPayload): string {
  if (details && details.length > 0) {
    return `${message}\n- ${details.join("\n- ")}`;
  }
  return message;
}

export function createPlanTaskErrorResponse(
  input: {
    requirements?: string;
    existingTaskStats?: {
      total: number;
      completed: number;
      pending: number;
    };
  } & CommonErrorPayload,
) {
  const markdown = buildErrorMarkdown(input);
  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "taskManager.plan" as const,
      payload: {
        markdown,
        prompt: markdown,
        requirements: input.requirements,
        existingTaskStats: input.existingTaskStats,
        errorCode: input.errorCode,
        errors: input.details,
      },
    },
  };
}

export function createAnalyzeTaskErrorResponse(
  input: {
    summary: string;
    initialConcept: string;
    previousAnalysis?: string;
  } & CommonErrorPayload,
) {
  const markdown = buildErrorMarkdown(input);
  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "taskManager.analyze" as const,
      payload: {
        markdown,
        summary: input.summary,
        initialConcept: input.initialConcept,
        previousAnalysis: input.previousAnalysis,
        errorCode: input.errorCode,
        errors: input.details,
      },
    },
  };
}

export function createReflectTaskErrorResponse(
  input: {
    summary: string;
    analysis: string;
  } & CommonErrorPayload,
) {
  const markdown = buildErrorMarkdown(input);
  return {
    content: [
      {
        type: "text" as const,
        text: markdown,
      },
    ],
    structuredContent: {
      kind: "taskManager.reflect" as const,
      payload: {
        markdown,
        summary: input.summary,
        analysis: input.analysis,
        errorCode: input.errorCode,
        errors: input.details,
      },
    },
  };
}
