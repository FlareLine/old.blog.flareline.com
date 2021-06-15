import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { BlogService } from './service';

export class BlogServiceStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);
		new BlogService(this, 'BlogService');
	}
}
