#!/usr/bin/env bash

echo -n "Enter ECR URI > "
read ECR_URI

TAG="$(date +%Y-%m-%d.%H.%M.%S)"
IMAGE_URI="${ECR_URI}:${TAG}"

cd ..

$(aws ecr get-login --no-include-email)
docker build --force-rm -f Dockerfile -t ${IMAGE_URI} .
docker push ${IMAGE_URI}

cd deployment

sed 's~\"IMAGE_URI\"~\"'${IMAGE_URI}'\"~g;' taskDefinition.int.json > taskDefinitionWithImage.int.json
TASK_DEFINITION_VERSION="$(aws ecs register-task-definition --cli-input-json file://taskDefinitionWithImage.int.json --query 'taskDefinition.[family,revision]' --output text | sed 's/\t/:/')"
aws ecs update-service --cluster cluster-int --service royalties-service --task-definition $TASK_DEFINITION_VERSION --query 'service.deployments' --output json
aws ecs wait services-stable --cluster cluster-int --services royalties-service
            
echo "DONE!"