import { StackProps, Stack, App } from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import {
  StaticWebsite,
  StaticWebsiteProps,
} from "../constructs/static-website";

export interface StaticWebsiteStackProps
  extends StackProps,
    StaticWebsiteProps {}

export class StaticWebsiteStack extends Stack {
  constructor(parent: App, name: string, props: StaticWebsiteStackProps) {
    super(parent, name, props);

    const website = new StaticWebsite(this, "StaticWebsite", props);

    new CfnOutput(this, "BucketName", {
      value: website.bucket.bucketName,
      exportName: `${name}-BucketName`,
    });

    new CfnOutput(this, "DistributionId", {
      value: website.distribution.distributionId,
      exportName: `${name}-DistributionId`,
    });

    new CfnOutput(this, "DistributionDomainName", {
      value: website.distribution.distributionDomainName,
      exportName: `${name}-DistributionDomainName`,
    });

    new CfnOutput(this, "CloudFrontUrl", {
      value: `https://${website.distribution.distributionDomainName}`,
      exportName: `${name}-CloudFrontUrl`,
    });

    if (props.domainName) {
      new CfnOutput(this, "CustomDomainName", {
        value: props.domainName,
        exportName: `${name}-CustomDomainName`,
      });
    }

    if (props.domainCertificateArn) {
      new CfnOutput(this, "DomainCertificateArn", {
        value: props.domainCertificateArn,
        exportName: `${name}-DomainCertificateArn`,
      });
    }
  }
}
