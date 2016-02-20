var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    username        : { type: String, unique: true, required: true },
    password        : { type: String, required: true },
    clearance		: { type: Number, default: 0 }
});

UserSchema.set('toJSON', {
	transform: function (doc, ret, options) {
		var retJSON = {
			_id: ret._id,
			username: ret.username
		};
		return retJSON;
	}
});

UserSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);