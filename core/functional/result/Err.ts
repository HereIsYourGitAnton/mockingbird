import type Result from './Result';
import type { Compute } from '../types';
import type { Option } from '../option';

import ResultError from './ResultError';
import { none, some } from '../option';

/**
 * Manages a value that represents failure.
 */
class Err<T, E> implements Result<T, E> {
    /**
     * Wraps the error value.
     *
     * @param value The value.
     */
    constructor(private value: E) {}

    and<U>(_: Result<U, E>): Result<U, E> {
        return new Err(this.value);
    }

    andThen<U>(_: Compute<T, Result<U, E>>): Result<U, E> {
        return new Err(this.value);
    }

    err(): Option<E> {
        return some(this.value);
    }

    expect(message: string): never {
        throw new ResultError(message);
    }

    expectErr(_: string): E {
        return this.value;
    }

    isErr(): boolean {
        return true;
    }

    isOk() {
        return false;
    }

    map<U>(_: Compute<T, U>): Result<U, E> {
        return new Err(this.value);
    }

    mapErr<F>(fn: Compute<E, F>): Result<T, F> {
        return new Err(fn(this.value));
    }

    mapOr<U>(def: U, _: Compute<T, U>): U {
        return def;
    }

    mapOrElse<U>(def: Compute<E, U>, _: Compute<T, U>): U {
        return def(this.value);
    }

    ok(): Option<T> {
        return none();
    }

    or<F>(def: Result<T, F>): Result<T, F> {
        return def;
    }

    orElse<F>(fn: Compute<E, Result<T, F>>): Result<T, F> {
        return fn(this.value);
    }

    unwrap(): never {
        let message: string;
        const type = typeof this.value;

        switch (type) {
            case 'function':
                message = '[Function]';
                break;

            case 'object':
                message = JSON.stringify(this.value);
                break;

            case 'symbol':
                message = '[Symbol]';
                break;

            default:
                message = this.value as any as string;
        }

        throw new ResultError(message);
    }

    unwrapErr(): E {
        return this.value;
    }

    unwrapOr(def: T): T {
        return def;
    }

    unwrapOrElse(fn: Compute<E, T>): T {
        return fn(this.value);
    }

    flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
        return this as any;
    }
}

export default Err;
