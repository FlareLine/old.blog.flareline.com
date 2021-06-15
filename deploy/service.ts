import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Certificate, CertificateValidation } from '@aws-cdk/aws-certificatemanager';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ApiGateway } from '@aws-cdk/aws-route53-targets';
import { Bucket } from '@aws-cdk/aws-s3';
import { Asset } from '@aws-cdk/aws-s3-assets';
import { Construct } from '@aws-cdk/core';
import { Endpoint, RootEndpoint } from './lib/endpoint';

export class BlogService extends Construct {
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const functionBucket = new Bucket(this, 'FunctionStore');
		const functionAsset = new Asset(this, 'GetFunctionAsset', {
			path: 'dist',
		});

		const contentTable = new Table(this, 'BlogContentTable', {
			billingMode: BillingMode.PAY_PER_REQUEST,
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'posted',
				type: AttributeType.NUMBER,
			},
		});

		const contentHandler = new Function(this, 'BlogContentHandler', {
			runtime: Runtime.NODEJS_14_X,
			code: Code.fromBucket(functionAsset.bucket, functionAsset.s3ObjectKey),
			handler: 'content/index.lambdaHandler',
			memorySize: 256,
			environment: {
				DYNAMO_TABLE: contentTable.tableName,
			},
		});

		const createHandler = new Function(this, 'BlogCreateHandler', {
			runtime: Runtime.NODEJS_14_X,
			code: Code.fromBucket(functionAsset.bucket, functionAsset.s3ObjectKey),
			handler: 'create/index.lambdaHandler',
			memorySize: 256,
			environment: {
				DYNAMO_TABLE: contentTable.tableName,
			},
		});

		const updateHandler = new Function(this, 'BlogUpdateHandler', {
			runtime: Runtime.NODEJS_14_X,
			code: Code.fromBucket(functionAsset.bucket, functionAsset.s3ObjectKey),
			handler: 'update/index.lambdaHandler',
			memorySize: 256,
			environment: {
				DYNAMO_TABLE: contentTable.tableName,
			},
		});

		functionBucket.grantReadWrite(contentHandler);
		functionBucket.grantReadWrite(createHandler);
		functionBucket.grantReadWrite(updateHandler);

		contentTable.grantReadData(contentHandler);
		contentTable.grantReadWriteData(createHandler);
		contentTable.grantReadWriteData(updateHandler);

		const contentIntegration = new LambdaIntegration(contentHandler, {});
		const createIntegration = new LambdaIntegration(createHandler, {});
		const updateIntegration = new LambdaIntegration(updateHandler, {});

		const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
			hostedZoneId: 'Z03308839UCKCOXZ5BOC',
			zoneName: 'flareline.com',
		});

		const certificate = new Certificate(this, 'BlogCertificate', {
			domainName: 'blog.flareline.com',
			validation: CertificateValidation.fromDns(hostedZone),
		});

		const api = new RestApi(this, 'BlogApi', {
			restApiName: 'Blog API Gateway',
			description: 'An API for blog content.',
			domainName: {
				domainName: 'blog.flareline.com',
				certificate,
			},
		});

		new ARecord(this, 'BlogDnsRecord', {
			zone: hostedZone,
			recordName: 'blog',
			target: RecordTarget.fromAlias(new ApiGateway(api))
		});

		new RootEndpoint(this, 'BlogPageEndpoint', {
			method: 'GET',
			lambdaIntegration: contentIntegration,
			apiGateway: api,
		});

		new Endpoint(this, 'BlogGetEndpoint', {
			method: 'GET',
			path: '{postId}',
			lambdaIntegration: contentIntegration,
			apiGateway: api,
		});

		new RootEndpoint(this, 'BlogCreateEndpoint', {
			method: 'POST',
			lambdaIntegration: createIntegration,
			apiGateway: api,
		});

		new RootEndpoint(this, 'BlogUpdateEndpoint', {
			method: 'PUT',
			lambdaIntegration: updateIntegration,
			apiGateway: api,
		});
	}
}
