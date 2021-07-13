import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { CreatePost } from '../core/database';
import { PostStub } from '../core/model';
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
	const maybeParsedBody = Option.of(event.body).map(JSON.parse);
	const maybePostStub: Option<PostStub> = maybeParsedBody
		.flatMap(parsedBody => Option.of(parsedBody.title as string)
			.flatMap(title => Option.of(parsedBody.description as string)
				.flatMap(description => Option.of(parsedBody.content as string)
					.map(content => ({ title, description, content }))
				)
			)
		);

	if(maybePostStub.isNone()) {
		return BadRequest('Invalid post.');
	}

	const postStub = maybePostStub.get();
	const errorOrPostId = await CreatePost(client, dynamoTable, postStub);

	if (errorOrPostId.isLeft()) {

		const error = errorOrPostId.getLeft();
		console.log(`An error ocurred while creating post - ${error.toString()}`);

		return InternalServerError('An error ocurred.');
	}

	const postId = errorOrPostId.getRight();

	return Ok(postId);
}
