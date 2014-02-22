all: deploy open

.PHONY: deploy
deploy:
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
