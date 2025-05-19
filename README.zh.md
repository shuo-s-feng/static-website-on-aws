# AWS 静态网站部署

[English](README.md) | [中文](README.zh.md)

这是一个基于 TypeScript 的 AWS CDK 项目，用于将静态网站部署到 AWS 基础设施。该项目提供了一个强大且可扩展的解决方案，用于使用 AWS 服务托管静态网站。

## 功能特点

- 使用 AWS CDK 自动创建和部署基础设施
- 基于环境的部署（测试环境和生产环境）

## 前置要求

- 海外 AWS 账户
- 安装 AWS CLI（[参考文档](https://docs.aws.amazon.com/zh_cn/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions)）并配置适当的凭证（[参考文档](https://docs.aws.amazon.com/zh_cn/cli/latest/userguide/getting-started-quickstart.html#getting-started-quickstart-new)）。为了快速尝试，我建议使用带有长期凭证（`Long-term credentials`）的 CLI 命令：
  ```
  aws configure
  ```
- 全局安装 AWS CDK CLI（[参考文档](https://docs.aws.amazon.com/zh_cn/cdk/v2/guide/getting-started.html#getting-started-install)）：
  ```
  npm install -g aws-cdk
  ```

## 安装步骤

1. 克隆仓库：

```bash
git clone https://github.com/shuo-s-feng/static-website-on-aws.git
cd static-website-on-aws
```

2. 安装依赖：

```bash
yarn install
```

## 项目结构

```
.
├── bin/                    # CDK 应用入口点
├── src/                    # 源代码
│   ├── constructs/        # 可重用的 CDK 构造
│   ├── stacks/           # CDK 堆栈
│   └── utils/            # 工具函数
├── examples/              # 示例配置
└── cdk.out/              # CDK 合成输出
```

## 环境配置

项目使用特定于环境的配置文件来管理不同的部署环境。在根目录更新以下文件：

### `.env.staging`

```bash
AWS_ACCOUNT='<AWS_账户ID，例如：123456789012>'
AWS_REGION='<AWS 区域，例如：us-east-1>'
STATIC_WEBSITE_APP_NAME='<应用名称，例如：StaticWebsite>'
# STATIC_WEBSITE_DOMAIN_NAME='<域名，例如：example.com>'
# STATIC_WEBSITE_DOMAIN_CERT_ARN='<SSL证书ARN，例如：arn:aws:acm:region:account:certificate/xxxx-xxxx-xxxx-xxxx>'
STATIC_WEBSITE_SOURCE_PATH='<源代码路径，例如：./examples/website-dist>'
```

### `.env.prod`

```bash
AWS_ACCOUNT='<AWS 账户ID，例如：123456789012>'
AWS_REGION='<AWS 区域，例如：us-east-1>'
STATIC_WEBSITE_APP_NAME='<应用名称，例如：StaticWebsite>'
# STATIC_WEBSITE_DOMAIN_NAME='<域名，例如：example.com>'
# STATIC_WEBSITE_DOMAIN_CERT_ARN='<SSL证书ARN，例如：arn:aws:acm:region:account:certificate/xxxx-xxxx-xxxx-xxxx>'
STATIC_WEBSITE_SOURCE_PATH='<源代码路径，例如：./examples/website-dist>'
```

请将占位符值替换为您的实际配置。注释行是可选的，如果您想使用带有 SSL 证书的自定义域名，可以取消注释。您可以使用 [./examples/website-dist](./examples/website-dist) 目录下的示例网站资源作为起点。

## 部署

### 环境设置

1. 按照上述说明更新环境配置文件
2. 填写适合您 AWS 账户和网站配置的值
3. 如果使用自定义域名，请取消注释并配置域名相关变量

### 测试环境

```bash
yarn deploy-web:staging
```

### 生产环境

```bash
yarn deploy-web:prod
```

注意：在部署之前，请确保您的 AWS 凭证已正确配置。部署过程将使用相应 `.env.*` 文件中的环境特定配置。
