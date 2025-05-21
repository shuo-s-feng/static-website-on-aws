import { StackProps, Stack, App } from "aws-cdk-lib";
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

    new StaticWebsite(this, "StaticWebsite", props);
  }
}
