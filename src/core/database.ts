import { DynamoDB } from 'aws-sdk'
import { left, right } from './either';
import { ErrorOr, TryAsync } from './error';
import { Post } from './model';
import { none, Option, some } from './option';

export const FetchPost = async (client: DynamoDB.DocumentClient, dynamoTable: string, postId: string): Promise<ErrorOr<Option<Post>>> => {

	const getParams: DynamoDB.DocumentClient.QueryInput = {
		TableName: dynamoTable,
		ProjectionExpression: Post.projection(),
		ExpressionAttributeValues: {
			':i': postId,
		},
		KeyConditionExpression: 'id = :i',
	};

	const queryResult = await TryAsync(() => client.query(getParams).promise());

	if(queryResult.isLeft()) {
		return left(queryResult.getLeft());
	}

	const maybeObjectMap = Option.of(queryResult.getRight().Items)
		.flatMap(
			items => items.length !== 0
				? some(items[0])
				: none<DynamoDB.DocumentClient.AttributeMap>()
		);

	return right(Post.fromMap(maybeObjectMap));
}
