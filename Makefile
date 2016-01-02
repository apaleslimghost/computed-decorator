SRC_FILES=$(wildcard src/*.js)
LIB_FILES=$(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: $(LIB_FILES)

lib/%.js: src/%.js
	mkdir -p $(@D)
	babel --presets es2015 $< -o $@

test: test.js $(LIB_FILES)
	babel-node --presets es2015 --plugins transform-decorators-legacy,transform-class-properties test.js

.PHONY: test
