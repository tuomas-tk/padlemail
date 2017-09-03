'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE emails (
      id       SERIAL PRIMARY KEY,
      email    TEXT NOT NULL,
      padlet   INTEGER NOT NULL,
      added    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )`
  );
};

exports.down = function(db) {
  return db.dropTable('emails');
};

exports._meta = {
  "version": 1
};
