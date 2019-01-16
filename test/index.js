GLOBAL.projRequire = function (module) {
	return require('../' + module);
};

const log = projRequire('lib');
const tc = require('test-console');
const test = require('tape');

log.setMinLogLevel('debug');

test('log.debug() prints correctly', function (t) {
	const err = tc.stdout.inspectSync(function () {
		log.debug('test_error');
	});

	const obj = JSON.parse(err[0]);

	t.equals(obj._level, 'debug');
	t.assert(obj._timestamp);
	t.equals(obj._git_commit, 'dev');
	t.equals(obj._service, 'unknown');
	t.equals(obj.code, 'test_error');
	t.assert(!obj.stack);
	t.end();
});

test('log.info() prints correctly', function (t) {
	const err = tc.stdout.inspectSync(function () {
		log.info('test_error');
	});

	const obj = JSON.parse(err[0]);

	t.equals(obj._level, 'info');
	t.assert(obj._timestamp);
	t.equals(obj._git_commit, 'dev');
	t.equals(obj._service, 'unknown');
	t.equals(obj.code, 'test_error');
	t.assert(!obj.stack);
	t.end();
});

test('log.warn() prints correctly', function (t) {
	const err = tc.stdout.inspectSync(function () {
		log.warn('test_error');
	});

	const obj = JSON.parse(err[0]);

	t.equals(obj._level, 'warn');
	t.assert(obj._timestamp);
	t.equals(obj._git_commit, 'dev');
	t.equals(obj._service, 'unknown');
	t.equals(obj.code, 'test_error');
	t.assert(!obj.stack);
	t.end();
});

test('log.error() prints correctly', function (t) {
	const err = tc.stderr.inspectSync(function () {
		log.error('test_error');
	});

	const obj = JSON.parse(err[0]);

	t.equals(obj._level, 'error');
	t.assert(obj._timestamp);
	t.equals(obj._git_commit, 'dev');
	t.equals(obj._service, 'unknown');
	t.equals(obj.code, 'test_error');
	t.assert(obj.stack);
	t.end();
});

test('log prints JSON correctly', function (t) {
	const err = tc.stderr.inspectSync(function () {
		log.error('test_error', { a: 'b', c: 'd' });
	});

	const obj = JSON.parse(err[0]);

	t.equals(obj._level, 'error');
	t.assert(obj._timestamp);
	t.equals(obj._git_commit, 'dev');
	t.equals(obj._service, 'unknown');
	t.equals(obj.code, 'test_error');
	t.equals(obj.meta.a, 'b');
	t.equals(obj.meta.c, 'd');
	t.assert(obj.stack);
	t.end();
});
