import * as t from 'io-ts'
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString'

type EmailBrand = {
	readonly Email: unique symbol
}

const EmailRegExp = new RegExp(/.+@.+/)

export const Email = t.brand(
	NonEmptyString,
	(s): s is t.Branded<NonEmptyString, EmailBrand> => EmailRegExp.test(s),
	'Email',
)
