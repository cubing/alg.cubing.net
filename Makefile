.PHONY: build
build:
	tsc

.PHONY: dev
dev:
	tsc --watch

.PHONY: deploy
deploy:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./ \
		towns.dreamhost.com:~/alg.cubing.net/v2/
	echo "\nDone deploying. Go to https://alg.cubing.net/v2/\n"

.PHONY: open
open:
	open "https://alg.cubing.net/v2/"
