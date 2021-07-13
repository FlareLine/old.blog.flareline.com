import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid';
import { left, right } from './either';
import { ErrorOr, TryAsync } from './error';
import { Page, Post, PostStub, PostSummary } from './model';
import { none, Option, some, somes } from './option';

export const CreatePost = async (client: DynamoDB.DocumentClient, dynamoTable: string, stub: PostStub): Promise<ErrorOr<string>> => {

	const id = uuid.v1();

	const putParams: DynamoDB.DocumentClient.PutItemInput = {
		TableName: dynamoTable,
		Item: {
			id,
			...stub,
		},
	}

	const errorOrPutResult = await TryAsync(() => client.put(putParams).promise());

	if(errorOrPutResult.isLeft()) {
		return left(errorOrPutResult.getLeft());
	}

	return right(id);
}

export const FetchPost = async (client: DynamoDB.DocumentClient, dynamoTable: string, postId: string): Promise<ErrorOr<Option<Post>>> => {

	const getParams: DynamoDB.DocumentClient.QueryInput = {
		TableName: dynamoTable,
		ProjectionExpression: Post.projection(),
		ExpressionAttributeValues: {
			':i': postId,
		},
		KeyConditionExpression: 'id = :i',
	};

	const errorOrQueryResult = await TryAsync(() => client.query(getParams).promise());

	if(errorOrQueryResult.isLeft()) {
		return left(errorOrQueryResult.getLeft());
	}

	const maybeQueryResults = Option.of(errorOrQueryResult.getRight().Items);

	const maybeObjectMap = maybeQueryResults
		.flatMap(
			items => items.length !== 0
				? some(items[0])
				: none<DynamoDB.DocumentClient.AttributeMap>()
		);

	return right(Post.fromMap(maybeObjectMap));
}

export const PagePosts = async (client: DynamoDB.DocumentClient, dynamoTable: string, maybeCursor: Option<string>): Promise<ErrorOr<Option<Page<PostSummary>>>> => {

	const pageParams: DynamoDB.DocumentClient.ScanInput = {
		TableName: dynamoTable,
		ProjectionExpression: PostSummary.projection(),
		Limit: 3,
	}

	if(maybeCursor.isSome()) {
		pageParams.ExclusiveStartKey = {
			'id': maybeCursor.get(),
		};
	}

	const errorOrScanResult = await TryAsync(() => client.scan(pageParams).promise());

	if(errorOrScanResult.isLeft()) {
		return left(errorOrScanResult.getLeft());
	}

	const scanOutput = errorOrScanResult.getRight();
	const maybeScanResults = Option.of(scanOutput.Items);
	const nextCursor = scanOutput.LastEvaluatedKey?.toString();

	const maybePageResult: Option<Page<PostSummary>> = maybeScanResults
		.map(
			scanResults => ({
				results: somes(scanResults.map(itemMap => PostSummary.fromMap(Option.of(itemMap)))),
				cursor: nextCursor,
			})
		);

	return right(maybePageResult);
}
