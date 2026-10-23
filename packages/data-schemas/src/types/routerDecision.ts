import type { Document, Types } from 'mongoose';

export interface IRouterDecision extends Omit<Document, 'model'> {
  user: Types.ObjectId;
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
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
