all: deploy open

.PHONY: deploy
deploy:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		--exclude Makefile \
		./ \
		cubing.net:~/cubing.net/1lpll/
	echo "\nDone deploying. Go to http://cubing.net/twisty.js\n"

.PHONY: open
open:
	open "http://cubing.net/twisty.js"

.PHONY: 1lpll
1lpll:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		--exclude Makefile \
		./ \
		cubing.net:~/cubing.net/1lpll/
	echo "\nDone deploying. Go to http://cubing.net/1lpll\n"

.PHONY: touch
touch:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		--exclude Makefile \
		./ \
		cubing.net:~/cubing.net/touch/
	echo "\nDone deploying. Go to http://cubing.net/touch\n"