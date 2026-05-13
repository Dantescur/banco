.PHONY: build install migrate seed start

build:
	pnpm install
	node ace build

install:
	cd build && pnpm i --prod

migrate:
	cd build && node ace migration:run --force

seed:
	cd build && node ace db:seed

start:
	cd build && node bin/server.js

deploy: build install migrate seed
	@echo "Deploy complete. Set NODE_ENV=production and HOST=0.0.0.0 via environment."
	@echo "Then: make start"
