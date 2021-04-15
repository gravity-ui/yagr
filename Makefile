build:
	npm run build

release-patch: build
	npm version patch
	npm publish
