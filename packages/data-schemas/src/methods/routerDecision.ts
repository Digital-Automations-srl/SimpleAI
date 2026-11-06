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
  preferredSpec?: string;
  jevModel?: string;
  inputTokens?: number;
  latencyMs?: number;
}

export interface LastRouterSpecFilter {
  user: string | Types.ObjectId;
  conversationId: string;
}

export function createRouterDecisionMethods(mongoose: typeof import('mongoose')): {
  createRouterDecision: (data: CreateRouterDecisionData) => Promise<IRouterDecision>;
  getLastRouterSpec: (filter: LastRouterSpecFilter) => Promise<string | undefined>;
} {
  async function createRouterDecision(data: CreateRouterDecisionData): Promise<IRouterDecision> {
    const RouterDecision = mongoose.models.RouterDecision as Model<IRouterDecision>;
    return await RouterDecision.create(data);
  }

  /** The spec that answered the conversation's latest routed turn. */
  async function getLastRouterSpec(filter: LastRouterSpecFilter): Promise<string | undefined> {
    const RouterDecision = mongoose.models.RouterDecision as Model<IRouterDecision>;
    const last = await RouterDecision.findOne(filter, 'spec')
      .sort({ createdAt: -1, _id: -1 })
      .lean<Pick<IRouterDecision, 'spec'>>();
    return last?.spec;
  }

  return { createRouterDecision, getLastRouterSpec };
}

export type RouterDecisionMethods = ReturnType<typeof createRouterDecisionMethods>;
