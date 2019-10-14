import { Either, left, right } from 'fp-ts/lib/Either'

export const StringEquals = (s1: string) => (
	s2: string,
): Either<Error, string> =>
	s1 === s2 ? right(s1) : left(new Error('Strings do not match!'))
