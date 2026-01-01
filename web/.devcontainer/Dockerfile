FROM node:24-trixie

WORKDIR /workspace

RUN apt-get update &&\
  apt-get install -y git ca-certificates sudo &&\
  rm -rf /var/lib/apt/lists/* &&\
  echo "node ALL=(ALL) NOPASSWD: /bin/chown" >> /etc/sudoers

USER node