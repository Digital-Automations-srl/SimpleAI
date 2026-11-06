import { logger } from '@librechat/data-schemas';

interface ProjectInstructionsAgent {
  additional_instructions?: string | null;
}

interface ProjectInstructionsParams {
  agent: ProjectInstructionsAgent;
  userId?: string;
  chatProjectId?: string | null;
  getChatProject: (user: string, projectId: string) => Promise<{ instructions?: string } | null>;
}

/**
 * SimpleAI: appends the chat project's instructions (e.g. the context of an AIDA project) to the
 * agent's additional instructions, so every chat of the project starts with it. The project is
 * read with the requesting user as owner, so an id from someone else's project adds nothing.
 */
export async function applyProjectInstructions({
  agent,
  userId,
  chatProjectId,
  getChatProject,
}: ProjectInstructionsParams): Promise<void> {
  if (!userId || !chatProjectId) {
    return;
  }
  try {
    const instructions = (await getChatProject(userId, chatProjectId))?.instructions?.trim();
    if (!instructions) {
      return;
    }
    agent.additional_instructions = [agent.additional_instructions?.trim(), instructions]
      .filter(Boolean)
      .join('\n\n');
  } catch (error) {
    logger.warn('[projects] Project instructions unavailable, continuing without them', error);
  }
}
