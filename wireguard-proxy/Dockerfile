FROM node:20.9.0-alpine3.18

HEALTHCHECK CMD /usr/bin/timeout 5s /bin/sh -c "/usr/bin/wg show | /bin/grep -q interface || exit 1" --interval=1m --timeout=5s --retries=3

RUN apk add --no-cache \
    dpkg \
    dumb-init \
    iptables \
    # iptables-legacy \
    wireguard-tools

WORKDIR /app

COPY ./wireguard-proxy/package*.json ./
RUN yarn install --frozen-lockfile
COPY ./wireguard-proxy/ .
RUN yarn build

# RUN update-alternatives --install /sbin/iptables iptables /sbin/iptables-legacy 10 --slave /sbin/iptables-restore iptables-restore /sbin/iptables-legacy-restore --slave /sbin/iptables-save iptables-save /sbin/iptables-legacy-save

EXPOSE 51871/udp

CMD ["yarn", "start:debug"]
