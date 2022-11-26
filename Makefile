.PHONY: docs
docs: clean zip
	mkdir -p docs
	cp -R src/alg.cubing.net/* docs/
	cp -R src/source-history docs/source # Copying is redundant, but doesn't waste `git` or APFS space

DATE=$(shell date "+%Y-%m-%d" | tr -d '\n')
HASH=$(shell git rev-parse HEAD)
ZIP_NAME=alg.cubing.net-$(DATE)-${HASH}.zip
ZIP_TEMP=./.temp/alg.cubing.net.zip

.PHONY: zip
zip:
	mkdir -p ./.temp
	echo ${HASH} > ./src/alg.cubing.net/VERSION.txt
	cd src/alg.cubing.net && zip -r ../../${ZIP_TEMP} *
	mv ${ZIP_TEMP} ./src/source-history/${ZIP_NAME}
	cp ./src/source-history/${ZIP_NAME} ./src/source-history/alg.cubing.net.zip # Copying is redundant, but doesn't waste `git` or APFS space

.PHONY: clean
clean:
	rm -rf ./.temp ./docs
