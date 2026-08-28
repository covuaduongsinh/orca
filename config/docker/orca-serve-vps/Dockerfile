# Builds and runs `orca serve` (the headless Orca runtime) for remote client
# pairing on a Dokploy-managed VPS. See docs/reference/headless-linux-server.md
# for the non-Docker systemd deployment this mirrors.

FROM node:24-bookworm AS build

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libasound2 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libsecret-1-dev \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    pkg-config \
    python3 \
    rpm \
    zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
  && corepack prepare pnpm@10.24.0 --activate

WORKDIR /workspace

COPY . .

RUN npm install -g node-gyp@11.5.0 \
  && export npm_config_node_gyp="$(npm root -g)/node-gyp/bin/node-gyp.js" \
  && pnpm install --frozen-lockfile

RUN pnpm run build:unpack

FROM ubuntu:24.04 AS runtime

ARG LIBASOUND_PACKAGE=libasound2t64

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    dbus-x11 \
    jq \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    "${LIBASOUND_PACKAGE}" \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    procps \
    util-linux \
    xauth \
    xvfb \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash orca

COPY --from=build /workspace/dist/linux-unpacked /app

# Why: Chromium's setuid sandbox helper must stay root-owned with the setuid
# bit (4755) to function; a blanket --chown to the non-root runtime user
# strips that and Electron aborts at startup rather than run unsandboxed.
RUN chown -R orca:orca /app \
  && chown root:root /app/chrome-sandbox \
  && chmod 4755 /app/chrome-sandbox

# Why: pre-create the mount point orca-owned so the persistent volume backing
# it (state under docs/reference/headless-linux-server.md's ~/.config) isn't
# created root-owned by Docker on first mount.
RUN mkdir -p /home/orca/.config && chown orca:orca /home/orca/.config

USER orca
# Why: Docker's USER directive doesn't export HOME for a non-shell
# ENTRYPOINT, and Electron's app.getPath('userData') requires HOME to
# resolve the Linux XDG config dir — without it, startup throws "Failed
# to get 'userData' path" before orca serve ever binds its listener.
ENV HOME=/home/orca
ENV LIBGL_ALWAYS_SOFTWARE=1
# Why: Chromium's zygote also needs a user namespace (CLONE_NEWUSER), which
# Docker's default seccomp profile denies without CAP_SYS_ADMIN — a far
# bigger privilege than the sandbox it would restore. Rely on the container's
# own isolation instead, via Orca's documented escape hatch for this exact
# case (src/cli/runtime/launch.ts), matching Puppeteer/Playwright's own
# Docker images.
ENV ORCA_APPIMAGE_NO_SANDBOX=1
WORKDIR /home/orca

EXPOSE 6768

ENTRYPOINT ["/app/resources/bin/orca-ide"]
CMD ["serve", "--port", "6768", "--pairing-address", "https://orca.dsc.edu.vn", "--json"]
