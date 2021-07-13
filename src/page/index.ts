import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { PagePosts } from '../core/database';
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

	const maybeQueryParams = Option.of(event.queryStringParameters);
	const maybeCursor = maybeQueryParams.flatMap(queryParams => Option.of(queryParams['cursor']));

	const errorOrMaybePageResult = await PagePosts(client, dynamoTable, maybeCursor);

	if (errorOrMaybePageResult.isLeft()) {

		const error = errorOrMaybePageResult.getLeft();
		console.log(`An error ocurred while paging posts - ${error.toString()}`);

		return InternalServerError('An error ocurred.');
	}

	const maybePageResult = errorOrMaybePageResult.getRight();

	if (maybePageResult.isNone()) {
		console.log(`No posts found with cursor '${maybeCursor.getOrElse('(none)')}'.`);

		return BadRequest('No post found.');
	}

	return Ok(maybePageResult.get());
}
