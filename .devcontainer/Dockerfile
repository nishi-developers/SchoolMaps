FROM node:24-trixie

WORKDIR /workspace

RUN apt-get update &&\
  apt-get install -y git ca-certificates &&\
  rm -rf /var/lib/apt/lists/*