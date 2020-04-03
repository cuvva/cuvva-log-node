const util = require('util');

function CuvvaError(code, reasons, meta) {
	if (!(this instanceof CuvvaError))
		return new CuvvaError(code, reasons, meta);

	if (!meta && !Array.isArray(reasons)) {
		meta = reasons;
		reasons = void 0;
	}

	for (var i in reasons) {
		if (!(reasons[i] instanceof CuvvaError))
			reasons[i] = CuvvaError.coerce(reasons[i]);
	}

	CuvvaError.super_(code);

	if (Error.captureStackTrace)
		Error.captureStackTrace(this, this.constructor);

	this.code = code;
	this.reasons = reasons;
	this.meta = meta;

	defineNonSerializable(this, 'name', 'CuvvaError');
	defineNonSerializable(this, 'message', this.code);
}

util.inherits(CuvvaError, Error);
module.exports = CuvvaError;

CuvvaError.coerce = function (error) {
	if (error instanceof CuvvaError)
		return error;

	var newError;

	if (typeof error.code === 'string') {
		// if code is a string, obj already conforms to CuvvaError structure
		newError = new CuvvaError(error.code, error.reasons, error.meta);
	} else if (error instanceof Error) {
		// if obj is an Error, pull out its useful details
		newError = new CuvvaError('unknown', { message: error.message });
	} else {
		// worst case, just provide obj in the meta fields
		newError = new CuvvaError('unknown', { error: error });
	}

	if (error instanceof Error)
		defineNonSerializable(newError, 'stack', error.stack);

	return newError;
};

function defineNonSerializable(obj, property, value) {
	Object.defineProperty(obj, property, {
		value: value,
		writable: false,
		enumerable: false, // prevents json serialization
		configurable: true, // allows redefinition
	});
}
