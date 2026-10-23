import { Schema } from 'mongoose';
import type { IRouterDecision } from '~/types';

const routerDecisionSchema: Schema<IRouterDecision> = new Schema<IRouterDecision>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
    },
    routerSpec: {
      type: String,
      required: true,
    },
    spec: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
    },
    model: {
      type: String,
    },
    tools: {
      type: [String],
      default: [],
    },
    confidence: {
      type: Number,
    },
    probabilities: {
      type: Schema.Types.Mixed,
    },
    toolProbabilities: {
      type: Schema.Types.Mixed,
    },
    fallbackReason: {
      type: String,
    },
    jevModel: {
      type: String,
    },
    inputTokens: {
      type: Number,
    },
    latencyMs: {
      type: Number,
    },
    tenantId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true },
);

routerDecisionSchema.index({ createdAt: -1 });
routerDecisionSchema.index({ conversationId: 1, createdAt: 1 });

export default routerDecisionSchema;
