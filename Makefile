build:
	npm run build

release-patch:
	npm version patch
	npm publish
