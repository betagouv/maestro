SHELL := /bin/bash
.ONESHELL:

db/migrate:
	npm run migrate-latest -w server

db/check-kysely:
ifndef CI
	npm run db:generate-types -w server
	npm run postdb:generate-types -w server
	npm run db:verify-types -w server
else
	npm run migrate-latest -w server
	npm run db:verify-types -w server -- --url postgres://postgres:postgres@localhost/maestro
endif

server/lint:
ifndef CI
	npm run lint -w server
else
	npm run lint:verify -w server
endif
