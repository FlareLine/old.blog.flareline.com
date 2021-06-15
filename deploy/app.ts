import { App } from '@aws-cdk/core';
import { BlogServiceStack } from './stack';

const app = new App();
new BlogServiceStack(app, 'BlogServiceStack');
