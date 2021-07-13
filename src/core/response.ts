import { APIGatewayProxyResult } from 'aws-lambda';

const Response = (statusCode: StatusCode, data: any): APIGatewayProxyResult => {
	return {
		statusCode,
		body: JSON.stringify(data),
	}
}

export const Ok = (data: any): APIGatewayProxyResult => Response(StatusCode.Ok, data);
export const BadRequest = (message: string): APIGatewayProxyResult => Response(StatusCode.BadRequest, message);
export const Unauthorized = (message: string): APIGatewayProxyResult => Response(StatusCode.Unauthorized, message);
export const InternalServerError = (message: string): APIGatewayProxyResult => Response(StatusCode.InternalServerError, message);

enum StatusCode {
	Ok = 200,
	BadRequest = 400,
	Unauthorized = 401,
	InternalServerError = 500,
}
