# Static Website on AWS

[English](README.md) | [中文](README.zh.md)

A TypeScript-based AWS CDK project for deploying static websites to AWS infrastructure. This project provides a robust and scalable solution for hosting static websites using AWS services.

## Features

- Automated infrastructure creation and deployment using AWS CDK
- Environment-based deployment (staging and production)

## Prerequisites

- AWS Account
- AWS CLI installed ([Reference](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions)) and configured with appropriate credentials ([Reference](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html#getting-started-quickstart-new)). To try out quickly, I recommend to use CLI commands with long-term credentials:
  ```
  aws configure
  ```
- AWS CDK CLI installed globally ([Reference](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html#getting-started-install)):
  ```
  npm install -g aws-cdk
  ```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/shuo-s-feng/static-website-on-aws.git
cd static-website-on-aws
```

2. Install dependencies:

```bash
yarn install
```

## Project Structure

```
.
├── bin/                    # CDK app entry points
├── src/                    # Source code
│   ├── constructs/        # Reusable CDK constructs
│   ├── stacks/           # CDK stacks
│   └── utils/            # Utility functions
├── examples/              # Example configurations
└── cdk.out/              # CDK synthesis output
```

## Environment Configuration

The project uses environment-specific configuration files to manage different deployment environments. Update the following files in the root directory:

### `.environment.staging`

```bash
AWS_ACCOUNT='<AWS_ACCOUNT_ID, e.g. 123456789012>'
AWS_REGION='<AWS_REGION, e.g. us-east-1>'
STATIC_WEBSITE_APP_NAME='<APP_NAME, e.g. StaticWebsite>'
# STATIC_WEBSITE_DOMAIN_NAME='<DOMAIN_NAME, e.g. example.com>'
# STATIC_WEBSITE_DOMAIN_CERT_ARN='<SSL_CERTIFICATE_ARN, e.g. arn:aws:acm:region:account:certificate/xxxx-xxxx-xxxx-xxxx>'
STATIC_WEBSITE_SOURCE_PATH='<SOURCE_PATH, e.g. ./examples/website-dist>'
```

### `.environment.prod`

```bash
AWS_ACCOUNT='<AWS_ACCOUNT_ID, e.g. 123456789012>'
AWS_REGION='<AWS_REGION, e.g. us-east-1>'
STATIC_WEBSITE_APP_NAME='<APP_NAME, e.g. StaticWebsite>'
# STATIC_WEBSITE_DOMAIN_NAME='<DOMAIN_NAME, e.g. example.com>'
# STATIC_WEBSITE_DOMAIN_CERT_ARN='<SSL_CERTIFICATE_ARN, e.g. arn:aws:acm:region:account:certificate/xxxx-xxxx-xxxx-xxxx>'
STATIC_WEBSITE_SOURCE_PATH='<SOURCE_PATH, e.g. ./examples/website-dist>'
```

Replace the placeholder values with your actual configuration. The commented lines are optional and can be uncommented if you want to use a custom domain with SSL certificate. Feel free to use the example website assets at [./examples/website-dist](./examples/website-dist) as a starting point.

## Deployment

### Environment Setup

1. Update the environment configuration files as described above
2. Fill in the appropriate values for your AWS account and website configuration
3. If using a custom domain, uncomment and configure the domain-related variables

### Staging Environment

```bash
yarn deploy-web:staging
```

### Production Environment

```bash
yarn deploy-web:prod
```

Note: Make sure your AWS credentials are properly configured before deployment. The deployment process will use the environment-specific configuration from the respective `.env.*` file.
