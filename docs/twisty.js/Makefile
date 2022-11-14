all: deploy

.PHONY: deploy
deploy:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		cubing.net:~/cubing.net/twisty.js-v2/
	echo "\nDone deploying. Go to https://cubing.net/twisty.js-v2\n"
