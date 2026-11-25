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
	npm run db:verify-types -w server -- --url postgres://postgres:password@localhost/maestro
endif
