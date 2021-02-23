/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Tracer } from 'dd-trace';
import { tracerOptions } from './tracer'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFn = function() {};

const callableHandlers = {
    get: function <T, P extends keyof T>(_target: T, _prop: P, _receiver: any): T[P] {
        const newMock = new Proxy(emptyFn, callableHandlers);
        return newMock as any as T[P];
    },

    apply: function <T extends (...args: any) => any, A extends Parameters<T>>(_target: T, _thisArg: any, _args: A): ReturnType<T> {
        const newMock = new Proxy(emptyFn, callableHandlers);
        return newMock as any as ReturnType<T>;
    },
}

const callableMock = new Proxy(emptyFn, callableHandlers);

type MockTracer = Tracer & { isMock?: boolean };

export const mockTracer = new Proxy({} as MockTracer, {
    get<K extends keyof MockTracer>(_target: Tracer, key: K) {
        if (tracerOptions.debug) {
            console.warn(`Tried to access the DataDog tracer before the init function was called. Attempted to access property "${key}".`);
        }

        if (key === 'isMock') {
            return true;
        }

        if (key === 'wrap') {
            return (_: any, f: any) => f;
        }

        return callableMock;
    },
});
