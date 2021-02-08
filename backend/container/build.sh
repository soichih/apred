set -x
set -e
tag=1.1
name=soichih/apred
docker build -t $name .
docker tag $name $name:$tag
docker push $name:$tag

