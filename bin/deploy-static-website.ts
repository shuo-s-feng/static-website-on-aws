import path from "path";
import { App } from "aws-cdk-lib";
import { StaticWebsiteStack } from "../src/stacks/static-website";
import { getEnvVariables } from "../src/utils/get-env-variables";

const envVars = getEnvVariables();
const camelCasedStage = envVars.stage[0].toUpperCase() + envVars.stage.slice(1);
const staticWebsiteStackName = `${envVars.staticWebsiteAppName}-${camelCasedStage}`;
const staticWebsiteAbsoluteSourcePath = path.resolve(
  process.cwd(),
  envVars.staticWebsiteSourcePath
);

const app = new App();

if (
  envVars.stage &&
  envVars.account &&
  envVars.region &&
  envVars.staticWebsiteSourcePath
) {
  console.info(
    "Deploying static website with config",
    {
      staticWebsiteStackName,
      account: envVars.account,
      sourcePath: staticWebsiteAbsoluteSourcePath,
      region: envVars.region,
      domainName: envVars.staticWebsiteDomainName,
      domainCertificateArn: envVars.staticWebsiteDomainCertificateARN,
      domainAutoConfigureRoute53:
        envVars.staticWebsiteDomainAutoConfigureRoute53,
    },
    "\n"
  );

  new StaticWebsiteStack(app, staticWebsiteStackName, {
    sourcePath: staticWebsiteAbsoluteSourcePath,
    domainName: envVars.staticWebsiteDomainName,
    domainCertificateArn: envVars.staticWebsiteDomainCertificateARN,
    domainAutoConfigureRoute53: envVars.staticWebsiteDomainAutoConfigureRoute53,
    env: {
      account: envVars.account,
      region: envVars.region,
    },
  });
} else {
  console.error(
    `Missing required environment variables to deploy ${staticWebsiteStackName}`
  );
}
