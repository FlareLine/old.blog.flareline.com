import { DynamoDB } from 'aws-sdk';
import { none, Option } from './option';

const IdKey: string = 'id';
const TitleKey: string = 'title';
const DescriptionKey: string = 'description';
const ContentKey: string = 'content';

export class PostStub {
	title: string;
	description: string;
	content: string;
}

export class PostSummary {
	id: string;
	title: string;
	description: string;

	static fields: () => string[] = () => [
		IdKey,
		TitleKey,
		DescriptionKey,
	];

	static projection: () => string = () => PostSummary.fields().join(', ');

	static fromMap(maybeMap: Option<DynamoDB.DocumentClient.AttributeMap>): Option<PostSummary> {
		if (maybeMap.isNone()) return none();

		const map = maybeMap.get();
		const maybeId = Option.of(map[IdKey]);
		const maybeTitle = Option.of(map[TitleKey]);
		const maybeDescription = Option.of(map[DescriptionKey]);

		const maybeSummary = maybeId
			.flatMap(id => maybeTitle
				.flatMap(title => maybeDescription
					.map(description => ({ id, title, description }))
				)
			);

		return maybeSummary;
	}
}

export class Post extends PostSummary {
	content: string;

	static fields: () => string[] = () => [
		...PostSummary.fields(),
		ContentKey,
	];

	static projection: () => string = () => Post.fields().join(', ');

	static fromMap(maybeMap: Option<DynamoDB.DocumentClient.AttributeMap>): Option<Post> {
		if (maybeMap.isNone()) return none();

		const map = maybeMap.get();
		const maybeSummary = PostSummary.fromMap(maybeMap);
		const maybeContent = Option.of(map[ContentKey]);

		const maybePost = maybeSummary
			.flatMap(summary => maybeContent
				.map(content => ({ ...summary, content }))
			);

		return maybePost;
	}
}

export class Page<T> {
	results: T[];
	cursor?: string;
}
