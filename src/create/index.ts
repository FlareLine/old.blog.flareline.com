import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Ok } from '../core/response';

const client = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return Ok('This is the create endpoint!');
}
