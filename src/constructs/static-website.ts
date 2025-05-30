import { Construct } from "constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  SSLMethod,
  SecurityPolicyProtocol,
  PriceClass,
  Distribution,
  DistributionProps,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
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
  sourcePath: string;
}

export class StaticWebsite extends Construct {
  readonly bucket: Bucket;
  readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);
    const { domainName, domainCertificateArn, sourcePath } = props;

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
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
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

    if (domainName && domainCertificateArn) {
      distributionProps = {
        ...distributionProps,
        certificate: Certificate.fromCertificateArn(
          this,
          "Certificate",
          domainCertificateArn
        ),
        domainNames: [domainName],
        sslSupportMethod: SSLMethod.SNI,
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      };
    } else if (domainName || domainCertificateArn) {
      throw Error("Either domain name or cerificate arn is empty");
    }

    // CloudFront distribution that caches and serves website bucket content with custom domain
    this.distribution = new Distribution(
      this,
      "Distribution",
      distributionProps
    );

    if (domainName && domainCertificateArn) {
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
