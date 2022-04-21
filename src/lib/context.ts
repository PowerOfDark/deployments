import { context } from "@actions/github";
import { getBooleanInput, getOptionalInput, getRequiredInput } from "./input";
import Logger from "./log";

export interface DeploymentContext {
  ref: string;
  sha: string;
  owner: string;
  repo: string;
  log: Logger;

  coreArgs: {
    description?: string;
    environment: string;
    logsURL: string;
    maxDeployments?: number;
  };
}

/**
 * Generates configuration for this action run.
 */
export function collectDeploymentContext(): DeploymentContext {
  const { ref, sha } = context;

  const customRepository = getOptionalInput("repository");

  const [owner, repo] = customRepository
    ? customRepository.split("/")
    : [context.repo.owner, context.repo.repo];
  if (!owner || !repo) {
    throw new Error(`invalid target repository: ${owner}/${repo}`);
  }

  const maxDeploymentsInput = getOptionalInput("max_deployments");

  return {
    ref: getOptionalInput("ref") || ref,
    sha,
    owner,
    repo,
    log: new Logger({ debug: getBooleanInput("debug", false) }),
    coreArgs: {
      environment: getRequiredInput("env"),
      description: getOptionalInput("desc"),
      maxDeployments: Number.parseInt(maxDeploymentsInput!) || undefined,
      logsURL:
        getOptionalInput("logs") ||
        `https://github.com/${owner}/${repo}/commit/${sha}/checks`,
    },
  };
}
