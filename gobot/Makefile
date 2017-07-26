.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

gobot: gobot.go ## Builds golang
	go build gobot.go

docker: gobot ## Builds the docker image
	docker-compose build

push: docker ## Pushes docker image
	docker-compose push

deploy: push ## Deploys to kubernetes
	kubectl delete -f ./kubernetes/deployment.yml
	kubectl create -f ./kubernetes/deployment.yml



