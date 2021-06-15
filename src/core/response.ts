import { APIGatewayProxyResult } from 'aws-lambda';

const Response = (statusCode: StatusCode, message: string, data?: any): APIGatewayProxyResult => {
	return {
		statusCode,
		body: JSON.stringify({
			message,
			data,
		}),
	}
}

export const Ok = (message: string, data?: any): APIGatewayProxyResult => Response(StatusCode.Ok, message, data);
export const BadRequest = (message: string, data?: any): APIGatewayProxyResult => Response(StatusCode.BadRequest, message, data);
export const Unauthorized = (message: string, data?: any): APIGatewayProxyResult => Response(StatusCode.Unauthorized, message, data);
export const InternalServerError = (message: string, data?: any): APIGatewayProxyResult => Response(StatusCode.InternalServerError, message, data);

enum StatusCode {
	Ok = 200,
	BadRequest = 400,
	Unauthorized = 401,
	InternalServerError = 500,
}
