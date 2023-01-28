# BrontoBase
BrontoBase is a Firebase alternative written in Deno

## Philosophy
BrontoBase is not designed to be scalable, but to be simple and easy. It's here to help beginners get started using Backends as a Service (BaaS) and advanced programmers quickly scaffold
proof of concepts.

We want it to be easy to install, deploy, and use.

## Getting started
BrontoBase currently uses a RESTful API. We will ship SDK's and libraries in due course, but at the moment it's still under heavy development, so we don't want to waste time developing
something that is likely to massively change in the near future.

### Installation
To get started, make sure you have sqlite3 and deno installed. This is all you should need!

If you're using linux, you can make use of the `launch.sh` script.

Firstly, run `chmod +x launch.sh` inside the root folder of the project. Then you can run `./launch.sh` and you'll be ready to go!

## Details

### Database
BrontoBase uses an SQLite database. This is by design, to keep things simple.