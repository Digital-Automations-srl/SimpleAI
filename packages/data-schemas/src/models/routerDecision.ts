import { Model } from 'mongoose';
import type { IRouterDecision } from '~/types';
import { applyTenantIsolation } from '~/models/plugins/tenantIsolation';
import routerDecisionSchema from '~/schema/routerDecision';

export function createRouterDecisionModel(
  mongoose: typeof import('mongoose'),
): Model<IRouterDecision> {
  applyTenantIsolation(routerDecisionSchema);
  return (
    mongoose.models.RouterDecision ||
    mongoose.model<IRouterDecision>('RouterDecision', routerDecisionSchema)
  );
}
