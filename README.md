# 🐳 Docker + PostgreSQL (MINIMAL SETUP)

## 🪟 Windows

### Download Docker Desktop

👉 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Install → restart → done.

Verify:

```powershell
docker --version
```

---

## 🐧 Linux (minimal)

### Install Docker

```bash
sudo apt update
sudo apt install docker
```

Verify:

```bash
sudo docker --version
```
U'll see version number

---

## PostgreSQL in Docker both Windows and Linux ( just don't use sudo in windows)

### Pull image

```bash
sudo docker pull postgres:alpine3.23
```

---

### Run PostgreSQL

```bash
sudo docker run --name pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres:alpine3.23
```

---

### Enter container

```bash
sudo docker exec -it pg sh
```
Dont use sudo on windows

Connect:

```sh
psql -U postgres -d mydb
```

Exit:

```sh
\q
exit
```

---

## 🔑 Credentials

```
host: localhost
port: 5432
user: postgres
password: postgres
db: mydb
```

---

## 🛑 Stop / start

```bash
sudo docker stop pg
sudo docker start pg
```
For windows don't use Sudo
---

