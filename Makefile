all: deploy open

.PHONY: deploy
deploy: alg.cubing.net.zip
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		alg.cubing.net:~/alg.cubing.net/live/
	echo "\nDone deploying. Go to https://alg.cubing.net/\n"

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
	rm -rf alg.cubing.net*.zip

	git checkout-index -a --prefix=./${ZIP_TEMP}/
	cd twisty.js && git checkout-index -a --prefix=../${ZIP_TEMP}/twisty.js/ && cd ..
	echo ${HASH} > ./${ZIP_TEMP}/HASH.txt

	cd ./${ZIP_TEMP}/ && zip -r "../${ZIP_NAME}" . && cd ..
	rm -rf ./${ZIP_TEMP}

	echo "Redirect 302 	/alg.cubing.net.zip /source/${ZIP_NAME}" > ./${SOURCE_TARGET}/.htaccess

clean:
	rm -rf ./${ZIP_TEMP}
	rm -rf ./${SOURCE_TARGET}/