const CuvvaError = require('./cuvva-error');

module.exports.CuvvaError = CuvvaError;

const errorLevels = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	fatal: 4,
};

const config = {
	handlers: {},
	minLogLevel: errorLevels.info,
	gitCommit: process.env.GIT_COMMIT || 'dev',
	service: 'unknown',
};

function defaultHandler(level, error) {
	const showStack = ['fatal', 'error'].includes(level);

	const formattedError = {
		...error,
		stack: showStack ? error.stack : void 0,
		reasons: error.reasons && error.reasons.map(r => ({ ...r, stack: showStack ? r.stack : void 0 })),
	}

	const message = JSON.stringify({
		_level: level,
		_timestamp: new Date().toISOString(),
		_git_commit: config.gitCommit,
		_service: config.service,
		...formattedError,
	});

	process.stderr.write(message + '\n');
}

function handleError(level, error) {
	if (errorLevels[level] < config.minLogLevel)
		return;

	defaultHandler(level, error);

	const handler = config.handlers[level];

	if (handler)
		handler(level, error);
}

module.exports.setHandler = function (level, handler) {
	if (handler === void 0 && typeof level === 'function') {
		handler = level;
		level = null;
	}

	if (typeof handler !== 'function')
		throw new Error('Handler is not a function');

	if (level) {
		config.handlers[level] = handler;
	} else {
		for (var prop in errorLevels)
			config.handlers[prop] = handler;
	}

};

module.exports.setMinLogLevel = function (level) {
	config.minLogLevel = errorLevels[level];
};

module.exports.setService = function (service) {
	config.service = service;
};

function logger(level) {
	return function (code, reasons, meta) {
		if (code instanceof CuvvaError) {
			handleError(level, code);
			return code;
		}

		const error = new CuvvaError(code, reasons, meta);
		handleError(level, error);
		return error;
	};
}

module.exports.debug = logger('debug');
module.exports.info = logger('info');
module.exports.warn = logger('warn');
module.exports.error = logger('error');
module.exports.fatal = logger('fatal');
