# Plottr Web

This repository contains the source code for Plottr Web.  The web
version of the Plottr app.

# Running Locally

There are a few steps to start the project locally.

## Step One (Emulate Firebase)

The first is to start the emulators.  See [the section on
emulators](Starting and Seeding the Firebase Emulators) for details
about the emulating Firebase locally.

## Step Two (Run Plottr on a Different Host Name)

The second step is to run Plottr on a different host name.  If you try
to access Plottr via `http://localhost:3000` (as the development
server suggests) then our CORS calls will fail because of security
restrictions and you'll not be able to get very far with your
development.  The solution to this problem is to create an alias for
`localhost` in your `hosts` file.  To create an alias, first open up
the hosts file with super user permissions:

```bash
sude nano /etc/hosts
```

Then add an alias for local host by adding the lines:

```
127.0.0.1           plottr.local
0:0:0:0:0:0:0:1     plottr.local
```

My hosts file looks like this after I edited it:

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1           plottr.local
0:0:0:0:0:0:0:1     plottr.local
127.0.0.1           localhost
255.255.255.255     broadcasthost
::1                 localhost
```

Once you've made this modification, you'll be able to access Plottr
locally using the following URL: `http://plottr.local:3000`.

## Step Three (Enable HTTPS)

Recent advents to web security mean that we can't mint a cookie token
from the `app.plottr.com` and `plottr-web-beta.vercel.app` sites and
use it from desktop without setting the `secure` and `httpOnly` fields
on it.  The standards now mandate the use of those flags because the
cookie is cross-origin (see [this MDN
article](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
for details.)

To get this all to work is quite involved because HTTPS is much more
complicated than HTTP.  Normally, domains are registered via a
certificate authority.  Our browsers know that a website is safe to
communicate with in a secure context because certain trusted
certificate authorities on the Internet say so.  When we develop
locally, we have to spoof the authority or tell our browsers that it's
Ok to visit our local servers.

We've committed a custom server script called `server.js` that uses
self-signed certificates to fire up the development server.  If you
run `yarn dev` it'll launch the server using this script and start the
development server on HTTPS.  When you navigate to
`https://plottr.local:3000` your browser will either refuse to go
there, or it'll hide an "advanced option" to ignore the risk and
continue.  Since we're working on our own website, it's safe to accept
the risk and continue ;)

You'll need to install a self-signed certificate to the repo in a
folder called `https_cert/` in the root of the project.  You can
automate most of this process (including the following paragraph!)
using a utility called `mkcert`.  Install it from
[here](https://github.com/FiloSottile/mkcert) and run `mkcert
-install` to create a root certificate authority.  It'll also try to
add it to Firefox and Chrome if it finds the right directories to
install it into.  You can generate a pair of certificates using
`mkcert plottr.local` and then place the two `.pem` files that it
creates into the `https_cert/` folder.

If `mkcert` fails to install the CA automatically, then you'll need to
do it yourself.  In Firefox, open up settings, search for
"certificates" and then click on "View certificates".  You can import
certificates from the dialog that pops up.

This is relatively painless.  Our problem is that we use emulators for
Firebase and the emulator suite doesn't yet support HTTPS.  So we need
to workaround that limitation.

To do so, we're using an `nginx` [reverse
proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).
The following section will guide you through installing `nginx` and
setting up the proxy.

### Step 1: Install `nginx`

#### Windows

Download and install it from [here](https://nginx.org/en/download.html).

#### Linux

Use your package manager to install it.  Some examples:

 - [Ubuntu](https://nginx.org/en/linux_packages.html#Ubuntu)
 - [Arch](https://wiki.archlinux.org/title/Nginx)
 - [Slackware](https://slackbuilds.org/repository/14.2/network/nginx/)

#### macOS

It's easiest with Homebrew `brew install nginx`.

### Step 2: Configure the Server

This is the most involved part.  It depends on your operating system
and where you installed `nginx` and it often goes wrong for subtle
reasons.  You need to take note of the _full-path_ of the certificates
in this project `<path-to-root>/https_cert`.

Then you need to open the config file for `nginx`s demo site (because
the demo site is what's enabled by default) and configure it to
forward from https to http, like so (take note of the different port
for SSL from what the emulator serves on):

```
server {
   listen 8081 ssl;
   server_name plottr.local;
   ssl_certificate  <project-root>/https_cert/plottr.local.pem;
   ssl_certificate_key  <project-root>/https_cert/plottr.local-key.pem;
   ssl_prefer_server_ciphers on;

   location / {
        proxy_pass http://localhost:8080;

        proxy_buffering           off;
        proxy_cache               off;
        chunked_transfer_encoding off;

        add_header              'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';

        proxy_set_header        Host $host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        Connection '';

        proxy_http_version 1.1;
   }
}

server {
   listen 9100 ssl;
   server_name plottr.local;
   ssl_certificate  <project-root>/https_cert/plottr.local.pem;
   ssl_certificate_key  <project-root>/https_cert/plottr.local-key.pem;
   ssl_prefer_server_ciphers on;

   location / {
        proxy_pass http://localhost:9099;

        proxy_buffering           off;
        proxy_cache               off;
        chunked_transfer_encoding off;

        add_header              'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';

        proxy_set_header        Host $host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        Connection '';

        proxy_http_version 1.1;
   }
}

server {
   listen 9200 ssl;
   server_name plottr.local;
   ssl_certificate  <project-root>/https_cert/plottr.local.pem;
   ssl_certificate_key  <project-root>/https_cert/plottr.local-key.pem;
   ssl_prefer_server_ciphers on;

   location / {
        proxy_pass http://localhost:9199;

        proxy_buffering           off;
        proxy_cache               off;
        chunked_transfer_encoding off;

        add_header              'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';

        proxy_set_header        Host $host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        proxy_set_header        Connection '';

        proxy_http_version 1.1;
   }
}
```

### Step 3: Fire Up `nginx`

This is also different per platform.  On Windows it might be a
service.  On older Linux distributions you can call it's init script:

`#/etc/rc.d/rc.nginx start`

### Troubleshooting

#### CORS Failed: SEC_ERROR_UNKNOWN_ISSUER

If requests to the Firebase emulators fail because of CORS errors,
it's usually because of the presence of a self-signed certificate.
This means that somewhere along the line, the certificate that was
generated for `nginx` didn't end up in a certificate store that
Firefox (or whatever browser you're using) respects.  If this happens,
then you'll need to find the `rootCA.pem` and `rootCA-key.pem` files
that `mkcert` created and re-export them to a `p12` certificate file.
You can manually import the `p12` file into Firefox/Chrome to have it
trust all connections to websites that used those certificates as the
root authority (i.e. the certificates that `mkcert` created on your
machine.

 - Find your local certificates created by `mkcert`.  On Linux, the
   directory was `~/.local/share/mkcert/`.  (It's likely to be the
   same on macOS.),
 - Run the following command from that directory and choose a password
   when prompted:
   `openssl pkcs12 -export -in rootCA.pem -inkey rootCA-key.pem -out server.p12`,
 - Import the `p12` file into your web browser.  In Firefox:
    - Open the settings menu and search for "certificates".
    - Click the "View Certificates" button,
    - On the "Your Certificates" tab, click on the "Import" button,
    - Find the `p12` file that we just generated and import it (you'll
      be prompted for the password that you just set).

# Starting and Seeding the Firebase Emulators

This project uses `Firebase`'s `Authentication` and `Firestore`.  You
can develop against local emulators of those services.  To do so, run
the following commands:

```bash
   pushd lib/plottr_firebase; firebase use plottr-ci; popd
```

(Selects the current project to connect to.)

```bash
  yarn start-emulators
```

and when that's finished starting up (note that it lists ports for
admin UIs) you can run the next command to seed the database and
create a test user:

```bash
  yarn seed-firestore
```

# Magical Knowledge

There are always things that one unearths when one arrives at a new
project.  This is my attempt at making those things fewer and further
between so as to avoid nasty surprises.

Please add to this section whenever you discover something! :)

## Keeping Track of the Current Project

The App looks at the `CURRENT_PROJECT` parameter in `sessionStorage`
to determine what project to load when we refresh.  Make sure that you
update this parameter when implementing a new way to select or switch
to a project.

There are plans to incorporate a `pid` query param to force the app to
load a particular project by id.

# `Pltr` Library

The core feature set of `Plottr` is modelled using actions, reducers
and selectors. It depends on `redux` to model state coherently and
uses several pieces of middleware to augment the data store with
features such as histories and undo.

All of this logic is intended to be housed in the `pltr` library. You
can find a sub tree of this repository, containing the `pltr` library,
in `/lib/pltr`.

## First Time Usage of `Pltr`

Before you get developing in this repository, be sure to set up
`pltr`'s repository as a remote to make it easier to work with the
subtree.

Use the following command to add `pltr` as a remote:

```bash
    git remote add -f pltr git@github.com:Plotinator/pltr.git
```

navigate to lib/pltr and install packages with `npm install`
(and don't forget to navigate back to the root)

## Developing With the `Pltr` Subtree

To develop the project and then downstream your changes back to
`pltr`, you should develop as though `pltr` is part of this
repository. There is no need to split commits or treat `pltr`
specially in any way, until you want to do one of two things:

1. Push your changes to `pltr` to it's repository.
2. Pull the changes made to `pltr` in it's repository into this
   repository.

To do 1. run the following command:

```bash
    git subtree push --prefix=lib/pltr/ pltr <your-branch-name-here>
```

To do 2. run the following command:

```bash
    git subtree pull --prefix lib/pltr pltr master --squash
```

## Embedding `Pltr` (Do Not Run)

This section is here to document the process which resulted in `pltr`
embedded as a subtree in this repository.

The following command embeds `pltr` into the current repository at a
path of `/lib`.

```bash
    git subtree add --prefix lib/pltr pltr master --squash
```

# The `plottr_components` Library

The [component library repo](https://github.com/Plotinator/plottr_components) is the new home of our components! :)
This branch adds `plottr_components` as a `git sub-tree` in the `/lib` folder.

## Working With the Library

You change the `plottr_components` library the same way you would work with `plottr_locales` or `pltr`.
i.e. develop `plottr_electron` as though it doesn't contain any subtrees, and push the changes to Github using the subtree commands in the [Readme](https://github.com/cameronsutter/plottr_electron#readme).

## Working Out-Of-Tree

You can also work on the components out-of-tree (i.e. checked out to a folder other than `plottr_electron/lib`) as long as the other Plottr libraries are checked out as sibling folders of this library.
i.e. you can checkout `pltr`, `plottr_locales` and `plottr_components` to an arbitrary folder on your computer and work with them like they're individual git repositories.

## Storybook

The component library comes with Storybook installed and configured.
Storybook helps you develop components in isolation of the rest of the application to be more sure that the components work in isolation.
The idea here is that if it works and looks good in Storybook, then it's the application's job to replicate how it looks and behaves in Storybook.

### Starting the Watch-Compiler for Components

You need to start a watcher process for the component library as well as the `plottr_electron` app if you're making changes to components.
To start the component library watch compiler, run the following commands from the root of the repository:

```bash
  cd lib/plottr_components
  npm run start
```

The compiler doesn't use webpack and doesn't minify anything.
It simply runs the Sass compiler and babel directly.
It's intended to be a light-weight process which reflects changes quickly, aids in debugging and doesn't place more burden on your system.

### Starting Storybook

While you make changes to components it's recommended that you start up Storybook to watch how the components look in isolation from `plottr_electron`.
You can start the storybook by running the following commands from the root of the repository:

```bash
  cd lib/plottr_components
  npm run storybook
```

The storybook will open in a new tab and changes that you make to components will reflect via Webpack's Hot Module Reloading (HMR) -- i.e. they'll reflect pretty quickly and without refreshing the page.

# NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
