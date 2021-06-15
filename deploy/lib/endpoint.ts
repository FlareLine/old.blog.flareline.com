import { IRestApi, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { Construct } from '@aws-cdk/core';

export interface RootEndpointProps {
	method: string,
	lambdaIntegration: LambdaIntegration,
	apiGateway: IRestApi,
}

export interface EndpointProps extends RootEndpointProps {
	path: string,
}

export class RootEndpoint extends Construct {
	constructor(scope: Construct, id: string, props: RootEndpointProps) {
		super(scope, id);
		const { method, lambdaIntegration, apiGateway } = props;
		apiGateway.root.addMethod(method, lambdaIntegration);
	}
}

export class Endpoint extends Construct {
	constructor(scope: Construct, id: string, props: EndpointProps) {
		super(scope, id);
		const { method, path, lambdaIntegration, apiGateway } = props;
		(apiGateway.root.getResource(path) || apiGateway.root.addResource(path)).addMethod(method, lambdaIntegration);
	}
}
