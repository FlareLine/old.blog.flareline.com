import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { FetchPost } from '../core/database';
import { Option } from '../core/option';
import { BadRequest, InternalServerError, Ok } from '../core/response';

const client = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

	const maybeDynamoTable = Option.of(process.env.DYNAMO_TABLE);

	if (maybeDynamoTable.isNone()) {
		console.error('DYNAMO_TABLE is not defined.');

		return InternalServerError('Configuration error.');
	}

	const dynamoTable = maybeDynamoTable.get();

	const maybePathParams = Option.of(event.pathParameters);
	const maybePostId = maybePathParams.flatMap(pathParams => Option.of(pathParams['postId']));

	if (maybePostId.isSome()) {

		const postId = maybePostId.get();
		const errorOrMaybePost = await FetchPost(client, dynamoTable, postId);

		if (errorOrMaybePost.isLeft()) {

			const error = errorOrMaybePost.getLeft();
			console.log(`An error ocurred while retrieving post '${postId}' - ${error.toString()}`);

			return InternalServerError('An error ocurred.');
		}

		const maybePost = errorOrMaybePost.getRight();

		if (maybePost.isNone()) {
			console.log(`No post found matching '${postId}'.`);

			return BadRequest('No post found.');
		}

		return Ok(maybePost.get());
	}

	return BadRequest('No post found.');
}
