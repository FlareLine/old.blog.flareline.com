abstract class Option<T> {
	/**
	 * Map between types A and B
	 * @param functor A map between type A and type B
	 * @returns The converted value wrapped in an Option
	 */
	abstract map<B>(functor: (a: T) => B): Option<B>;

	/**
	 * Map between types A and B before flattening the surrounding Monad
	 * @param functor A map between type A and type B
	 * @returns The Option<Option<B>>, flattened as Option<B>
	 */
	abstract flatMap<B>(functor: (a: T) => Option<B>): Option<B>;

	/**
	 * If true, this option is a Some (representing a container with a value).
	 */
	abstract isSome(): boolean;

	/**
	 * If true, this option is a None (representing a container without a value).
	 */
	abstract isNone(): boolean;

	/**
	 * Get the underlying value or return the supplied default.
	 * @param defaultVal The default value to return if no value is present.
	 */
	abstract getOrElse(defaultVal: T): T;

	/**
	 * Unwrap the value.
	 * @description Ensure you wrap this in an `isSome` guard.
	 * @example
	 * // assume a myOption: Option<T>
	 * if (myOption.isSome()) {
	 * 	 return myOption.get();
	 * }
	 */
	abstract get(): T;

	static of<T>(value: T | null | undefined): Option<T> {
		if (value === null || value === undefined) {
			return none();
		}

		return some(value);
	}
}

class Some<T> implements Option<T> {
	value: T

	constructor(value: T) {
		this.value = value;
	}

	get(): T {
		return this.value;
	}

	getOrElse(_: T): T {
		return this.value;
	}

	isSome(): boolean {
		return true;
	}

	isNone(): boolean {
		return false;
	}

	flatMap<B>(functor: (a: T) => Option<B>): Option<B> {
		return functor(this.value);
	}

	map<B>(functor: (a: T) => B): Option<B> {
		return Option.of(functor(this.value));
	}
}

class None<T> implements Option<T> {
	get(): T {
		throw new Error('No value to retrieve.');
	}

	getOrElse(defaultVal: T): T {
		return defaultVal;
	}

	isSome(): boolean {
		return false;
	}

	isNone(): boolean {
		return true;
	}

	flatMap<B>(_: (a: T) => Option<B>): Option<B> {
		return none<B>();
	}

	map<B>(_: (a: T) => B): Option<B> {
		return none<B>();
	}

}

const some = <T>(value: T): Option<T> => {
	return new Some(value)
};

const none = <T>(): Option<T> => {
	return new None<T>();
};

const somes = <T>(values: Option<T>[]): T[] => {
	return values
		.filter(el => el.isSome())
		.map(el => el.get());
};

export {
	Option,
	some,
	none,
	somes,
}
