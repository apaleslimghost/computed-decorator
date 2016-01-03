SRC_FILES=$(wildcard src/*.js)
LIB_FILES=$(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: $(LIB_FILES)

lib/%.js: src/%.js
	mkdir -p $(@D)
	babel $< -o $@

test: test.js $(LIB_FILES)
	mocha -r babel-register

.PHONY: test
