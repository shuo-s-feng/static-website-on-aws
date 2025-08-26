import { Construct } from "constructs";
import { Annotations } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  SSLMethod,
  SecurityPolicyProtocol,
  PriceClass,
  Distribution,
  DistributionProps,
  ViewerProtocolPolicy,
  AccessLevel,
  LambdaEdgeEventType,
} from "aws-cdk-lib/aws-cloudfront";
import { experimental as cloudfrontExperimental } from "aws-cdk-lib/aws-cloudfront";
import { Code, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  HostedZone,
  ARecord,
  RecordTarget,
  AaaaRecord,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
} from "aws-cdk-lib/aws-s3";

const WEBSITE_INDEX_DOCUMENT = "index.html";

export interface StaticWebsiteProps {
  domainName?: string;
  domainCertificateArn?: string;
  domainAutoConfigureRoute53?: boolean;
  sourcePath: string;
  useLambdaEdge?: boolean;
}

export class StaticWebsite extends Construct {
  readonly bucket: Bucket;
  readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);
    const {
      domainName,
      domainCertificateArn,
      domainAutoConfigureRoute53,
      sourcePath,
      useLambdaEdge,
    } = props;

    // S3 bucket for hosting the static website
    this.bucket = new Bucket(this, "Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true,
    });

    // Props for the CloudFront distribution
    let distributionProps: DistributionProps = {
      comment: "CloudFront distribution for hosting a static website",
      defaultRootObject: WEBSITE_INDEX_DOCUMENT,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket, {
          // Add list access to avoid 403 errors when accessing non-existent files in the bucket
          originAccessLevels: [AccessLevel.READ, AccessLevel.LIST],
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          // Return index html file for the 404 response from S3 to let frontend handle routing
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: `/${WEBSITE_INDEX_DOCUMENT}`,
        },
      ],
      priceClass: PriceClass.PRICE_CLASS_ALL,
    };

    if (useLambdaEdge) {
      distributionProps = {
        ...distributionProps,
        defaultBehavior: {
          ...distributionProps.defaultBehavior,
          edgeLambdas: [
            {
              functionVersion: new cloudfrontExperimental.EdgeFunction(
                this,
                "OriginRequestEdgeFunction",
                {
                  runtime: Runtime.NODEJS_20_X,
                  code: Code.fromAsset("src/lambda/origin-request"),
                  handler: "index.handler",
                  description:
                    "Rewrite URIs to support directory indexes and extensionless .html at origin request",
                }
              ).currentVersion,
              eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
            },
          ],
        },
      };
    }

    if (domainCertificateArn) {
      distributionProps = {
        ...distributionProps,
        certificate: Certificate.fromCertificateArn(
          this,
          "Certificate",
          domainCertificateArn
        ),
        sslSupportMethod: SSLMethod.SNI,
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      };
    }

    if (domainName) {
      distributionProps = {
        ...distributionProps,
        domainNames: [domainName],
      };
    }

    if (domainName && !domainCertificateArn) {
      Annotations.of(this).addWarning(
        "Custom domain partially configured. The domain name is provided but the certificate is not. Skipping SSL configuration."
      );
    }
    if (!domainName && domainCertificateArn) {
      Annotations.of(this).addWarning(
        "Custom domain partially configured. The certificate is provided but the domain name is not. Skipping custom domain setup."
      );
    }

    // CloudFront distribution that caches and serves website bucket content with custom domain
    this.distribution = new Distribution(
      this,
      "Distribution",
      distributionProps
    );

    if (domainName && domainAutoConfigureRoute53) {
      // Hosted Zone for the website custom domain
      const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
        domainName,
      });

      // Route53 A record for the CloudFront distribution
      new ARecord(this, "ARecord", {
        recordName: domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        zone: hostedZone,
      });

      // Route53 AAA record for the CloudFront distribution
      new AaaaRecord(this, "AAAARecord", {
        recordName: domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        zone: hostedZone,
      });
    }

    // Upload local website content to S3 bucket
    new BucketDeployment(this, "BucketDeployment", {
      sources: [Source.asset(sourcePath)],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });
  }
}
