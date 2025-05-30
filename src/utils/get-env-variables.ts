import dotenv from "dotenv";
import path from "path";
import { env } from "process";

export const getEnvVariables = () => {
  const envFile = `.env.${env.NODE_ENV}`;

  console.info(`Parsing environment variables from ${envFile}\n`);
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });

  const envVariables = {
    stage: env.NODE_ENV ?? "",
    account: env.AWS_ACCOUNT ?? "",
    region: env.AWS_REGION,

    staticWebsiteAppName: env.STATIC_WEBSITE_APP_NAME ?? "StaticWebsite",
    staticWebsiteDomainName: env.STATIC_WEBSITE_DOMAIN_NAME ?? "",
    staticWebsiteDomainCertificateARN: env.STATIC_WEBSITE_DOMAIN_CERT_ARN ?? "",
    staticWebsiteSourcePath: env.STATIC_WEBSITE_SOURCE_PATH ?? "",
  };

  return envVariables;
};

export default getEnvVariables;
