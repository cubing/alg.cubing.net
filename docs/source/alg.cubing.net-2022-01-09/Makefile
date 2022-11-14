all: deploy open

.PHONY: deploy
deploy: alg.cubing.net.zip
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		alg.cubing.net:~/alg.cubing.net/
	echo "\nDone deploying. Go to https://alg.cubing.net/\n"

.PHONY: deploy-test
deploy-test:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		alg.cubing.net:~/alg.cubing.net/test/
	echo "\nDone deploying. Go to https://alg.cubing.net/test/\n"

.PHONY: open
open:
	open "https://alg.cubing.net/"

HASH=$(shell git rev-parse HEAD)
DATE=$(shell date "+%Y-%m-%d" | tr -d '\n')
SOURCE_TARGET=source
ZIP_NAME=alg.cubing.net-$(DATE).zip
ZIP_TEMP=${SOURCE_TARGET}/zip-temp

.PHONY: alg.cubing.net.zip
alg.cubing.net.zip:
	rm -rf ./${ZIP_TEMP}
	rm -rf ./${SOURCE_TARGET}/alg.cubing.net*.zip

	git checkout-index -a --prefix=./${ZIP_TEMP}/
	cd twisty.js     && git checkout-index -a    --prefix=../${ZIP_TEMP}/twisty.js/     && cd ..
	cd twisty.js/alg && git checkout-index -a --prefix=../../${ZIP_TEMP}/twisty.js/alg/ && cd ..
	echo ${HASH} > ./${ZIP_TEMP}/VERSION.txt

	cd ./${ZIP_TEMP}/ && zip -r "../${ZIP_NAME}" . && cd ..
	rm -rf ./${ZIP_TEMP}

	echo "Redirect 302 	/source/alg.cubing.net.zip /${SOURCE_TARGET}/${ZIP_NAME}" > ./${SOURCE_TARGET}/.htaccess

clean:
	rm -rf ./${ZIP_TEMP}
	rm -rf ./${SOURCE_TARGET}/