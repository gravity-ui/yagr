build:
	npm run build

release-patch: build
	npm version patch
	npm publish

release-minor: build
	npm version minor
	npm publish
