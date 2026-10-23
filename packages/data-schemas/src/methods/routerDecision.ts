import type { Model, Types } from 'mongoose';
import type { IRouterDecision } from '~/types';

export interface CreateRouterDecisionData {
  user: string | Types.ObjectId;
  conversationId?: string;
  routerSpec: string;
  spec: string;
  endpoint?: string;
  model?: string;
  tools: string[];
  confidence?: number;
  probabilities?: Record<string, number>;
  toolProbabilities?: Record<string, number>;
  fallbackReason?: string;
  jevModel?: string;
  inputTokens?: number;
  latencyMs?: number;
}

export function createRouterDecisionMethods(mongoose: typeof import('mongoose')): {
  createRouterDecision: (data: CreateRouterDecisionData) => Promise<IRouterDecision>;
} {
  async function createRouterDecision(data: CreateRouterDecisionData): Promise<IRouterDecision> {
    const RouterDecision = mongoose.models.RouterDecision as Model<IRouterDecision>;
    return await RouterDecision.create(data);
  }

  return { createRouterDecision };
}

export type RouterDecisionMethods = ReturnType<typeof createRouterDecisionMethods>;
