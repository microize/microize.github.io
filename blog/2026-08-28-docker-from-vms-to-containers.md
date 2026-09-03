---
title: "Docker Notes: From Virtual Machines to Containers"
date: 2026-08-28
excerpt: "My learning notes on why Docker beat traditional VMs, how its architecture evolved from a single daemon to containerd + shim + runc, and the basics of images, registries, and the CLI."
tags: ["docker", "devops", "containers", "learning-notes"]
layout: post.njk
image: ""
---

I've been going through Docker fundamentals recently, and writing things down is the only way they actually stick. These are my raw learning notes, cleaned up into something more readable — starting from *why* Docker exists at all, through to how its architecture actually works under the hood, and the basic commands to get moving.

---

## Why Docker? The Evolution from Virtual Machines

Every application has its own dependencies — specific runtime versions, libraries, configuration. Before containers, the standard way to isolate one application's dependencies from another was to give it its own **Virtual Machine**.

That works, but it doesn't scale well:

- If you're running a separate VM per application, **every single VM needs its own full OS installed**.
- More OS installs means more disk, more memory, more CPU overhead — and cost climbs fast as the number of applications grows.
- Most of that overhead has nothing to do with the application itself — it's just the tax of running a full guest OS per workload.

Containers solve this differently. Instead of virtualizing an entire machine (hardware + OS + app), a container packages **just the application and its dependencies**, and runs directly on the host machine's OS kernel. Each container still operates in isolation from the others — but without duplicating the OS underneath every single one.

That's the core trade Docker makes: keep the isolation, drop the per-app OS tax.

---

## Architecture of Docker

The original, simple picture of Docker has three pieces:

- **Docker CLI** — accepts the user's commands (`docker run`, `docker build`, etc.)
- **REST API** — carries those commands from the CLI to the daemon
- **Docker Daemon** — does the actual work of creating and running containers

```
Docker CLI  →  REST API  →  Docker Daemon
```

### The architecture evolved

Later, this was split further, into a layered runtime:

**Docker Daemon → containerd → shim → runc**

- **runc** — the low-level piece that actually runs the container. On its own, `runc` can start a container, but with real limitations — it's not meant to be used standalone for day-to-day work.
- **shim** — sits between containerd and runc, and is what makes containers **daemonless**. In the old architecture, if the Docker daemon restarted, every running container went down with it. With the shim, a container keeps running in the background even if the daemon restarts — the shim just reconnects to the daemon once it's back online.
- **containerd** — manages the container lifecycle: start, stop, pause.
- **Docker Daemon** — sits on top, coordinating with containerd and exposing everything through the Docker CLI.

This layering is what makes containers resilient to a daemon restart — something the original single-daemon design couldn't offer.

---

## Installing and Running Docker

Once Docker is installed, a handful of commands cover most of day-to-day daemon management:

```bash
# check the installed version
docker --version

# start / stop the Docker service
systemctl start docker
systemctl stop docker
systemctl status docker

# run the daemon directly (useful for debugging)
sudo dockerd
sudo dockerd --debug
```

`dockerd` is the daemon process itself — running it directly with `--debug` is handy when you want verbose output while troubleshooting, instead of going through the systemd service.

---

## Images: The Blueprint Behind Every Container

An **image** is the blueprint — a container is what you get when you actually *run* that image. In other words:

> **Container = a running instance of an Image**

When you run `docker run <image-name>`, Docker resolves it in a specific order:

1. It first looks for the image **locally**.
2. If it isn't found locally, it pulls it from the default **public Docker registry — Docker Hub** (`hub.docker.com`).

```bash
docker run hello-world
docker run <image-name>
```

### Images on Docker Hub come in three trust tiers

- **Official** — maintained directly by Docker or the upstream project (e.g. `python`, `nginx`, `postgres`).
- **Verified** — published by a verified organization/publisher, but not an "Official" image.
- **Unverified** — community-published images, with no verification behind them — use with more caution.

### Container, in one line

A container is your **application plus everything it depends on** — libraries, runtime, config — bundled from an image and run in isolation.

Registries themselves can be **public** (Docker Hub) or **private** (self-hosted or cloud-provider registries like Azure Container Registry / ECR / GCR) — useful once you're shipping images you don't want publicly available.

---

## Takeaways

1. Containers exist to avoid the **per-application OS tax** that plagued VM-per-app setups.
2. Docker's architecture moved from a single fragile daemon to a layered **daemon → containerd → shim → runc** model specifically to survive daemon restarts.
3. An **image is the blueprint**; a **container is the running instance**.
4. `docker run` always checks locally before falling back to Docker Hub.
5. Not all images carry the same trust level — Official and Verified images are a safer default than unverified community ones.

More Docker notes to come as I work through networking, volumes, and Compose.
